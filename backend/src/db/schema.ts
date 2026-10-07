import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const leadSourceEnum = pgEnum("lead_source", ["assessment", "estimator", "manual"]);
export const leadStatusEnum = pgEnum("lead_status", [
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
export const leadClassificationEnum = pgEnum("lead_classification", [
  "qualified",
  "needs_clarification",
  "site_inspection_likely",
  "outside_service_area",
  "priority_review",
]);
export const qualificationDecisionEnum = pgEnum("qualification_decision", ["confirmed", "overridden"]);
export const staffRoleEnum = pgEnum("staff_role", ["customer_support", "technical", "manager", "admin"]);
export const inspectionRequestStatusEnum = pgEnum("inspection_request_status", ["requested", "scheduled", "completed", "cancelled"]);

export type LeadAnswers = Record<string, unknown>;
export type EstimateSnapshot = {
  currency: "PHP";
  minimum: number;
  maximum: number;
  assumptions?: string[];
};

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  referenceCode: varchar("reference_code", { length: 32 }).notNull().unique(),
  source: leadSourceEnum("source").notNull(),
  status: leadStatusEnum("status").notNull().default("new"),
  classification: leadClassificationEnum("classification").notNull(),
  reviewedClassification: leadClassificationEnum("reviewed_classification"),
  qualificationDecision: qualificationDecisionEnum("qualification_decision"),
  qualificationReviewReason: text("qualification_review_reason"),
  qualificationReviewedBy: varchar("qualification_reviewed_by", { length: 160 }),
  qualificationReviewedAt: timestamp("qualification_reviewed_at", { withTimezone: true }),
  confirmedInspectionTriggers: jsonb("confirmed_inspection_triggers").$type<string[]>().notNull().default([]),
  qualificationScore: integer("qualification_score").notNull(),
  classificationReasons: jsonb("classification_reasons").$type<string[]>().notNull().default([]),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 254 }),
  service: varchar("service", { length: 120 }).notNull().default("LPG installation"),
  cityMunicipality: varchar("city_municipality", { length: 160 }).notNull(),
  barangay: varchar("barangay", { length: 160 }).notNull(),
  addressLine: text("address_line"),
  houseUnitNumber: varchar("house_unit_number", { length: 80 }),
  answers: jsonb("answers").$type<LeadAnswers>().notNull().default({}),
  estimate: jsonb("estimate").$type<EstimateSnapshot | null>(),
  missingQuestions: jsonb("missing_questions").$type<string[]>().notNull().default([]),
  inspectionTriggers: jsonb("inspection_triggers").$type<string[]>().notNull().default([]),
  assignedTo: uuid("assigned_to"),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("leads_status_idx").on(table.status),
  index("leads_created_at_idx").on(table.createdAt),
  index("leads_source_idx").on(table.source),
]);

export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 80 }).notNull(),
  message: text("message").notNull(),
  actorName: varchar("actor_name", { length: 160 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("lead_activities_lead_id_idx").on(table.leadId)]);

export const callRecords = pgTable("call_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  checks: jsonb("checks").$type<Record<string, boolean>>().notNull().default({}),
  comments: jsonb("comments").$type<Record<string, string>>().notNull().default({}),
  callSummary: text("call_summary").notNull().default(""),
  updatedBy: varchar("updated_by", { length: 160 }).notNull(),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  finalizedBy: varchar("finalized_by", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("call_records_lead_id_unique").on(table.leadId)]);

export const siteInspectionRequests = pgTable("site_inspection_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  status: inspectionRequestStatusEnum("status").notNull().default("requested"),
  reason: text("reason").notNull(),
  inspectionTriggers: jsonb("inspection_triggers").$type<string[]>().notNull().default([]),
  preferredDate: timestamp("preferred_date", { withTimezone: true }),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  assignedTechnicalName: varchar("assigned_technical_name", { length: 160 }),
  technicalNotes: text("technical_notes"),
  requestedBy: varchar("requested_by", { length: 160 }).notNull(),
  requestedByRole: staffRoleEnum("requested_by_role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("site_inspection_requests_lead_id_unique").on(table.leadId)]);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
