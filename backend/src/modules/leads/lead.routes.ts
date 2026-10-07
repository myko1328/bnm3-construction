import { randomUUID } from "node:crypto";
import { type SQL, and, desc, eq } from "drizzle-orm";
import express, { type Router } from "express";
import { db } from "../../db/client.js";
import { callRecords, leadActivities, leads } from "../../db/schema.js";
import { qualifyLead } from "./lead-qualification.js";
import { createLeadSchema, finalizeCallRecordSchema, leadIdParamsSchema, listLeadsQuerySchema, managerQuestionSchema, saveCallRecordSchema, updateLeadStatusSchema } from "./lead.schemas.js";

export const leadRouter: Router = express.Router();

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

  const activities = await db.select().from(leadActivities).where(eq(leadActivities.leadId, lead.id)).orderBy(desc(leadActivities.createdAt));
  response.json({ data: { ...lead, activities } });
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
  const now = new Date();
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
  const now = new Date();
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

leadRouter.patch("/:id/status", async (request, response) => {
  const params = leadIdParamsSchema.safeParse(request.params);
  const body = updateLeadStatusSchema.safeParse(request.body);
  if (!params.success || !body.success) {
    response.status(400).json({ error: "Invalid status update" });
    return;
  }

  const [lead] = await db.update(leads).set({ status: body.data.status, updatedAt: new Date() }).where(eq(leads.id, params.data.id)).returning();
  if (!lead) {
    response.status(404).json({ error: "Lead not found" });
    return;
  }

  await db.insert(leadActivities).values({
    leadId: lead.id,
    activityType: "status_changed",
    message: body.data.note ?? `Lead status changed to ${body.data.status}.`,
    actorName: body.data.actorName,
    metadata: { status: body.data.status },
  });

  response.json({ data: lead });
});
