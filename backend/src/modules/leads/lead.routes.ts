import { randomUUID } from "node:crypto";
import { type SQL, and, desc, eq } from "drizzle-orm";
import express, { type Router } from "express";
import { db } from "../../db/client.js";
import { leadActivities, leads } from "../../db/schema.js";
import { qualifyLead } from "./lead-qualification.js";
import { createLeadSchema, leadIdParamsSchema, listLeadsQuerySchema, updateLeadStatusSchema } from "./lead.schemas.js";

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
