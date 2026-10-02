import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import { type SQL, and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { leadActivities, leads } from "../../db/schema.js";
import { qualifyLead } from "./lead-qualification.js";
import { createLeadSchema, leadIdParamsSchema, listLeadsQuerySchema, updateLeadStatusSchema } from "./lead.schemas.js";

export const leadRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request, reply) => {
    const parsed = createLeadSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid lead data", details: parsed.error.flatten() });

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

    return reply.code(201).send({ data: lead });
  });

  app.get("/", async (request, reply) => {
    const parsed = listLeadsQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid query", details: parsed.error.flatten() });

    const filters: SQL[] = [];
    if (parsed.data.status) filters.push(eq(leads.status, parsed.data.status));
    if (parsed.data.source) filters.push(eq(leads.source, parsed.data.source));
    const rows = await db.select().from(leads).where(filters.length ? and(...filters) : undefined).orderBy(desc(leads.createdAt)).limit(parsed.data.limit);
    return { data: rows };
  });

  app.get("/:id", async (request, reply) => {
    const parsed = leadIdParamsSchema.safeParse(request.params);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid lead ID" });

    const [lead] = await db.select().from(leads).where(eq(leads.id, parsed.data.id)).limit(1);
    if (!lead) return reply.code(404).send({ error: "Lead not found" });
    const activities = await db.select().from(leadActivities).where(eq(leadActivities.leadId, lead.id)).orderBy(desc(leadActivities.createdAt));
    return { data: { ...lead, activities } };
  });

  app.patch("/:id/status", async (request, reply) => {
    const params = leadIdParamsSchema.safeParse(request.params);
    const body = updateLeadStatusSchema.safeParse(request.body);
    if (!params.success || !body.success) return reply.code(400).send({ error: "Invalid status update" });

    const [lead] = await db.update(leads).set({ status: body.data.status, updatedAt: new Date() }).where(eq(leads.id, params.data.id)).returning();
    if (!lead) return reply.code(404).send({ error: "Lead not found" });

    await db.insert(leadActivities).values({
      leadId: lead.id,
      activityType: "status_changed",
      message: body.data.note ?? `Lead status changed to ${body.data.status}.`,
      actorName: body.data.actorName,
      metadata: { status: body.data.status },
    });
    return { data: lead };
  });
};
