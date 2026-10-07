import { z } from "zod";

export const leadSourceSchema = z.enum(["assessment", "estimator", "manual"]);
export const leadStatusSchema = z.enum([
  "new",
  "assigned",
  "contact_attempted",
  "customer_contacted",
  "needs_clarification",
  "site_inspection_recommended",
  "inspection_scheduled",
  "ready_for_quotation",
  "converted",
  "closed",
]);
export const leadClassificationSchema = z.enum(["qualified", "needs_clarification", "site_inspection_likely", "outside_service_area", "priority_review"]);
export const staffRoleSchema = z.enum(["customer_support", "technical", "manager", "admin"]);

export const createLeadSchema = z.object({
  source: leadSourceSchema,
  customer: z.object({
    name: z.string().trim().min(2).max(160),
    phone: z.string().trim().min(7).max(40),
    email: z.string().trim().email().max(254).optional(),
    consentedAt: z.coerce.date(),
  }),
  project: z.object({
    service: z.string().trim().min(2).max(120).default("LPG installation"),
    cityMunicipality: z.string().trim().min(2).max(160),
    barangay: z.string().trim().min(2).max(160),
    addressLine: z.string().trim().max(500).optional(),
    houseUnitNumber: z.string().trim().max(80).optional(),
  }),
  answers: z.record(z.string(), z.unknown()).default({}),
  estimate: z.object({
    currency: z.literal("PHP"),
    minimum: z.number().nonnegative(),
    maximum: z.number().nonnegative(),
    assumptions: z.array(z.string()).optional(),
  }).refine((value) => value.maximum >= value.minimum, "Maximum estimate must be at least the minimum estimate.").optional(),
  missingQuestions: z.array(z.string().trim().min(1)).default([]),
  projectSignals: z.object({
    requiresDrilling: z.boolean().default(false),
    unclearPipeRoute: z.boolean().default(false),
    multipleFloors: z.boolean().default(false),
    existingSystemModification: z.boolean().default(false),
    commercialProperty: z.boolean().default(false),
    safetyConcern: z.boolean().default(false),
  }).default({
    requiresDrilling: false,
    unclearPipeRoute: false,
    multipleFloors: false,
    existingSystemModification: false,
    commercialProperty: false,
    safetyConcern: false,
  }),
});

export const listLeadsQuerySchema = z.object({
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const leadIdParamsSchema = z.object({ id: z.string().uuid() });
export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
  note: z.string().trim().min(1).max(1000),
  actorName: z.string().trim().min(1).max(160),
  actorRole: staffRoleSchema,
});

export const qualificationReviewSchema = z.object({
  decision: z.enum(["confirmed", "overridden"]),
  classification: leadClassificationSchema,
  reason: z.string().trim().min(10).max(4000),
  inspectionTriggers: z.array(z.string().trim().min(1).max(160)).max(20),
  actorName: z.string().trim().min(1).max(160),
  actorRole: staffRoleSchema,
});

export const createInspectionRequestSchema = z.object({
  reason: z.string().trim().min(10).max(4000),
  inspectionTriggers: z.array(z.string().trim().min(1).max(160)).max(20),
  preferredDate: z.coerce.date().optional(),
  actorName: z.string().trim().min(1).max(160),
  actorRole: staffRoleSchema,
});

export const updateInspectionRequestSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled"]),
  scheduledFor: z.coerce.date().optional(),
  assignedTechnicalName: z.string().trim().min(1).max(160).optional(),
  technicalNotes: z.string().trim().max(4000).optional(),
  actorName: z.string().trim().min(1).max(160),
  actorRole: staffRoleSchema,
}).superRefine((value, context) => {
  if (value.status === "scheduled" && (!value.scheduledFor || !value.assignedTechnicalName)) {
    context.addIssue({ code: "custom", message: "A schedule and assigned technical person are required.", path: ["scheduledFor"] });
  }
  if (value.status === "completed" && !value.technicalNotes) {
    context.addIssue({ code: "custom", message: "Technical completion notes are required.", path: ["technicalNotes"] });
  }
});

const recordMapSchema = z.record(z.string().min(1).max(120), z.boolean());
const commentMapSchema = z.record(z.string().min(1).max(120), z.string().max(4000));

export const saveCallRecordSchema = z.object({
  checks: recordMapSchema,
  comments: commentMapSchema,
  callSummary: z.string().max(10000),
  actorName: z.string().trim().min(1).max(160),
});

export const finalizeCallRecordSchema = saveCallRecordSchema.extend({
  requiredCheckIds: z.array(z.string().min(1).max(120)).min(1).max(100),
  requiredCommentIds: z.array(z.string().min(1).max(120)).min(1).max(100),
});

export const managerQuestionSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  actorName: z.string().trim().min(1).max(160),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
