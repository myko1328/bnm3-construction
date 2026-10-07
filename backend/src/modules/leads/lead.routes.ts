import { randomUUID } from "node:crypto";
import { type SQL, and, desc, eq, sql } from "drizzle-orm";
import express, { type Router } from "express";
import { db } from "../../db/client.js";
import { callRecords, leadActivities, leads, siteInspectionRequests } from "../../db/schema.js";
import { qualifyLead } from "./lead-qualification.js";
import { createInspectionRequestSchema, createLeadSchema, finalizeCallRecordSchema, leadIdParamsSchema, listLeadsQuerySchema, managerQuestionSchema, qualificationReviewSchema, saveCallRecordSchema, updateInspectionRequestSchema, updateLeadStatusSchema } from "./lead.schemas.js";

export const leadRouter: Router = express.Router();

const allowedStatusTransitions = {
  new: ["assigned", "contact_attempted", "customer_contacted", "needs_clarification", "site_inspection_recommended", "closed"],
  assigned: ["contact_attempted", "customer_contacted", "needs_clarification", "site_inspection_recommended", "closed"],
  contact_attempted: ["customer_contacted", "needs_clarification", "site_inspection_recommended", "closed"],
  customer_contacted: ["needs_clarification", "site_inspection_recommended", "ready_for_quotation", "closed"],
  needs_clarification: ["customer_contacted", "site_inspection_recommended", "ready_for_quotation", "closed"],
  site_inspection_recommended: ["inspection_scheduled", "needs_clarification", "closed"],
  inspection_scheduled: ["needs_clarification", "ready_for_quotation", "closed"],
  ready_for_quotation: ["needs_clarification", "converted", "closed"],
  converted: ["closed"],
  closed: [],
} as const;

leadRouter.post("/", async (request, response) => {
  const parsed = createLeadSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid lead data", details: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const qualification = qualifyLead(input);
  const referenceCode = `BNM-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const [lead] = await db.insert(leads).values({
    referenceCode,
    source: input.source,
    classification: qualification.classification,
    qualificationScore: qualification.score,
    classificationReasons: qualification.reasons,
    customerName: input.customer.name,
    phone: input.customer.phone,
    email: input.customer.email,
    service: input.project.service,
    cityMunicipality: input.project.cityMunicipality,
    barangay: input.project.barangay,
    addressLine: input.project.addressLine,
    houseUnitNumber: input.project.houseUnitNumber,
    answers: input.answers,
    estimate: input.estimate ?? null,
    missingQuestions: input.missingQuestions,
    inspectionTriggers: qualification.inspectionTriggers,
    consentedAt: input.customer.consentedAt,
  }).returning();

  if (!lead) throw new Error("Lead insert did not return a record.");

  await db.insert(leadActivities).values({
    leadId: lead.id,
    activityType: "lead_created",
    message: `Lead created from ${input.source}.`,
    metadata: { classification: qualification.classification, score: qualification.score },
  });

  response.status(201).json({ data: lead });
});

leadRouter.get("/", async (request, response) => {
  const parsed = listLeadsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }

  const filters: SQL[] = [];
  if (parsed.data.status) filters.push(eq(leads.status, parsed.data.status));
  if (parsed.data.source) filters.push(eq(leads.source, parsed.data.source));
  const rows = await db.select().from(leads).where(filters.length ? and(...filters) : undefined).orderBy(desc(leads.createdAt)).limit(parsed.data.limit);
  response.json({ data: rows });
});

leadRouter.get("/:id", async (request, response) => {
  const parsed = leadIdParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid lead ID" });
    return;
  }

  const [lead] = await db.select().from(leads).where(eq(leads.id, parsed.data.id)).limit(1);
  if (!lead) {
    response.status(404).json({ error: "Lead not found" });
    return;
  }

  const [activities, inspectionRows] = await Promise.all([
    db.select().from(leadActivities).where(eq(leadActivities.leadId, lead.id)).orderBy(desc(leadActivities.createdAt)),
    db.select().from(siteInspectionRequests).where(eq(siteInspectionRequests.leadId, lead.id)).limit(1),
  ]);
  response.json({ data: { ...lead, activities, siteInspectionRequest: inspectionRows[0] ?? null } });
});

leadRouter.get("/:id/call-record", async (request, response) => {
  const parsed = leadIdParamsSchema.safeParse(request.params);
  if (!parsed.success) return void response.status(400).json({ error: "Invalid lead ID" });
  const [lead] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, parsed.data.id)).limit(1);
  if (!lead) return void response.status(404).json({ error: "Lead not found" });
  const [record] = await db.select().from(callRecords).where(eq(callRecords.leadId, lead.id)).limit(1);
  response.json({ data: record ?? null });
});

leadRouter.put("/:id/call-record", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = saveCallRecordSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid call record", details: body.success ? undefined : body.error.flatten() });
  const [lead] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!lead) return void response.status(404).json({ error: "Lead not found" });
  const [existing] = await db.select().from(callRecords).where(eq(callRecords.leadId, lead.id)).limit(1);
  if (existing?.finalizedAt) return void response.status(409).json({ error: "This call record is finalized and cannot be edited." });
  const now = sql`now()`;
  const [record] = await db.insert(callRecords).values({ leadId: lead.id, checks: body.data.checks, comments: body.data.comments, callSummary: body.data.callSummary, updatedBy: body.data.actorName, updatedAt: now })
    .onConflictDoUpdate({ target: callRecords.leadId, set: { checks: body.data.checks, comments: body.data.comments, callSummary: body.data.callSummary, updatedBy: body.data.actorName, updatedAt: now } }).returning();
  await db.insert(leadActivities).values({ leadId: lead.id, activityType: "call_record_saved", message: "Updated the customer call record.", actorName: body.data.actorName });
  response.json({ data: record });
});

leadRouter.post("/:id/call-record/finalize", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = finalizeCallRecordSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid finalized call record", details: body.success ? undefined : body.error.flatten() });
  const missingChecks = body.data.requiredCheckIds.filter((id) => body.data.checks[id] !== true);
  const missingComments = body.data.requiredCommentIds.filter((id) => !body.data.comments[id]?.trim());
  if (missingChecks.length || missingComments.length || !body.data.callSummary.trim()) return void response.status(400).json({ error: "Complete every required call item, customer response, and the call summary before finalizing." });
  const [lead] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!lead) return void response.status(404).json({ error: "Lead not found" });
  const [existing] = await db.select().from(callRecords).where(eq(callRecords.leadId, lead.id)).limit(1);
  if (existing?.finalizedAt) return void response.status(409).json({ error: "This call record is already finalized." });
  const now = sql`now()`;
  const [record] = await db.insert(callRecords).values({ leadId: lead.id, checks: body.data.checks, comments: body.data.comments, callSummary: body.data.callSummary, updatedBy: body.data.actorName, finalizedAt: now, finalizedBy: body.data.actorName, updatedAt: now })
    .onConflictDoUpdate({ target: callRecords.leadId, set: { checks: body.data.checks, comments: body.data.comments, callSummary: body.data.callSummary, updatedBy: body.data.actorName, finalizedAt: now, finalizedBy: body.data.actorName, updatedAt: now } }).returning();
  await db.insert(leadActivities).values({ leadId: lead.id, activityType: "call_record_finalized", message: "Finalized the customer call record.", actorName: body.data.actorName });
  response.json({ data: record });
});

leadRouter.post("/:id/manager-questions", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = managerQuestionSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid manager question" });
  const [lead] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!lead) return void response.status(404).json({ error: "Lead not found" });
  const [activity] = await db.insert(leadActivities).values({ leadId: lead.id, activityType: "manager_question", message: `Follow-up question: ${body.data.question}`, actorName: body.data.actorName, metadata: { question: body.data.question } }).returning();
  response.status(201).json({ data: activity });
});

leadRouter.post("/:id/qualification", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = qualificationReviewSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid qualification review", details: body.success ? undefined : body.error.flatten() });
  const [current] = await db.select().from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!current) return void response.status(404).json({ error: "Lead not found" });
  if (body.data.decision === "confirmed" && body.data.classification !== current.classification) {
    return void response.status(400).json({ error: "A confirmed review must keep the preliminary classification." });
  }
  if (body.data.decision === "overridden" && body.data.classification === current.classification) {
    return void response.status(400).json({ error: "Choose a different classification when overriding the preliminary result." });
  }
  const now = sql`now()`;
  const [lead] = await db.update(leads).set({
    reviewedClassification: body.data.classification,
    qualificationDecision: body.data.decision,
    qualificationReviewReason: body.data.reason,
    qualificationReviewedBy: body.data.actorName,
    qualificationReviewedAt: now,
    confirmedInspectionTriggers: body.data.inspectionTriggers,
    updatedAt: now,
  }).where(eq(leads.id, current.id)).returning();
  await db.insert(leadActivities).values({
    leadId: current.id,
    activityType: "qualification_reviewed",
    message: body.data.decision === "confirmed" ? `Confirmed the preliminary ${body.data.classification.replaceAll("_", " ")} classification.` : `Overrode the preliminary classification to ${body.data.classification.replaceAll("_", " ")}.`,
    actorName: body.data.actorName,
    metadata: { decision: body.data.decision, classification: body.data.classification, reason: body.data.reason, inspectionTriggers: body.data.inspectionTriggers, actorRole: body.data.actorRole },
  });
  response.json({ data: lead });
});

leadRouter.post("/:id/site-inspection", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = createInspectionRequestSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid site-inspection request", details: body.success ? undefined : body.error.flatten() });
  const [lead] = await db.select().from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!lead) return void response.status(404).json({ error: "Lead not found" });
  if (["converted", "closed"].includes(lead.status)) return void response.status(409).json({ error: `A ${lead.status} lead cannot receive a new site-inspection request.` });
  const [existing] = await db.select({ id: siteInspectionRequests.id }).from(siteInspectionRequests).where(eq(siteInspectionRequests.leadId, lead.id)).limit(1);
  if (existing) return void response.status(409).json({ error: "A site-inspection request already exists for this lead." });
  const now = sql`now()`;
  const [inspection] = await db.insert(siteInspectionRequests).values({
    leadId: lead.id,
    reason: body.data.reason,
    inspectionTriggers: body.data.inspectionTriggers,
    preferredDate: body.data.preferredDate,
    requestedBy: body.data.actorName,
    requestedByRole: body.data.actorRole,
  }).returning();
  await db.update(leads).set({ status: "site_inspection_recommended", updatedAt: now }).where(eq(leads.id, lead.id));
  await db.insert(leadActivities).values({
    leadId: lead.id,
    activityType: "site_inspection_requested",
    message: "Created an internal site-inspection request.",
    actorName: body.data.actorName,
    metadata: { reason: body.data.reason, inspectionTriggers: body.data.inspectionTriggers, preferredDate: body.data.preferredDate?.toISOString(), actorRole: body.data.actorRole },
  });
  response.status(201).json({ data: inspection });
});

leadRouter.patch("/:id/site-inspection", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = updateInspectionRequestSchema.safeParse(request.body);
  if (!params.success || !body.success) return void response.status(400).json({ error: "Invalid site-inspection update", details: body.success ? undefined : body.error.flatten() });
  if (body.data.status === "completed" && body.data.actorRole === "customer_support") {
    return void response.status(403).json({ error: "Customer-support personnel cannot complete technical site inspections." });
  }
  const [inspection] = await db.select().from(siteInspectionRequests).where(eq(siteInspectionRequests.leadId, params.data.id)).limit(1);
  if (!inspection) return void response.status(404).json({ error: "Site-inspection request not found" });
  const allowedInspectionStatuses = inspection.status === "requested" ? ["scheduled", "cancelled"] : inspection.status === "scheduled" ? ["scheduled", "completed", "cancelled"] : [];
  if (!allowedInspectionStatuses.includes(body.data.status)) return void response.status(409).json({ error: `A ${inspection.status} inspection cannot move to ${body.data.status}.` });
  const now = sql`now()`;
  const [updated] = await db.update(siteInspectionRequests).set({
    status: body.data.status,
    scheduledFor: body.data.scheduledFor ?? inspection.scheduledFor,
    assignedTechnicalName: body.data.assignedTechnicalName ?? inspection.assignedTechnicalName,
    technicalNotes: body.data.technicalNotes ?? inspection.technicalNotes,
    updatedAt: now,
  }).where(eq(siteInspectionRequests.id, inspection.id)).returning();
  if (body.data.status === "scheduled") await db.update(leads).set({ status: "inspection_scheduled", updatedAt: now }).where(eq(leads.id, params.data.id));
  await db.insert(leadActivities).values({
    leadId: params.data.id,
    activityType: `site_inspection_${body.data.status}`,
    message: `Site inspection ${body.data.status}.`,
    actorName: body.data.actorName,
    metadata: { status: body.data.status, scheduledFor: body.data.scheduledFor?.toISOString(), assignedTechnicalName: body.data.assignedTechnicalName, technicalNotes: body.data.technicalNotes, actorRole: body.data.actorRole },
  });
  response.json({ data: updated });
});

leadRouter.patch("/:id/status", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = updateLeadStatusSchema.safeParse(request.body);
  if (!params.success || !body.success) {
    response.status(400).json({ error: "Invalid status update" });
    return;
  }

  if (body.data.status === "ready_for_quotation" && body.data.actorRole === "customer_support") {
    response.status(403).json({ error: "Customer-support personnel cannot mark technical feasibility as ready for quotation." });
    return;
  }

  const [current] = await db.select().from(leads).where(eq(leads.id, params.data.id)).limit(1);
  if (!current) return void response.status(404).json({ error: "Lead not found" });
  if (current.status === body.data.status) return void response.status(409).json({ error: "The lead already has this status." });
  if (!(allowedStatusTransitions[current.status] as readonly string[]).includes(body.data.status)) {
    return void response.status(409).json({ error: `A ${current.status.replaceAll("_", " ")} lead cannot move directly to ${body.data.status.replaceAll("_", " ")}.` });
  }
  if (body.data.status === "ready_for_quotation") {
    const [inspection] = await db.select({ status: siteInspectionRequests.status }).from(siteInspectionRequests).where(eq(siteInspectionRequests.leadId, current.id)).limit(1);
    if (inspection && inspection.status !== "completed") return void response.status(409).json({ error: "Complete the required site inspection before marking this lead ready for quotation." });
  }
  const [lead] = await db.update(leads).set({ status: body.data.status, updatedAt: sql`now()` }).where(eq(leads.id, params.data.id)).returning();
  if (!lead) {
    response.status(404).json({ error: "Lead not found" });
    return;
  }

  await db.insert(leadActivities).values({
    leadId: lead.id,
    activityType: "status_changed",
    message: body.data.note,
    actorName: body.data.actorName,
    metadata: { previousStatus: current.status, status: body.data.status, actorRole: body.data.actorRole },
  });

  response.json({ data: lead });
});
