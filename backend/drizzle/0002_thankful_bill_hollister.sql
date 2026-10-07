CREATE TYPE "public"."inspection_request_status" AS ENUM('requested', 'scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."qualification_decision" AS ENUM('confirmed', 'overridden');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('customer_support', 'technical', 'manager', 'admin');--> statement-breakpoint
CREATE TABLE "site_inspection_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"status" "inspection_request_status" DEFAULT 'requested' NOT NULL,
	"reason" text NOT NULL,
	"inspection_triggers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_date" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"assigned_technical_name" varchar(160),
	"technical_notes" text,
	"requested_by" varchar(160) NOT NULL,
	"requested_by_role" "staff_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "reviewed_classification" "lead_classification";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "qualification_decision" "qualification_decision";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "qualification_review_reason" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "qualification_reviewed_by" varchar(160);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "qualification_reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "confirmed_inspection_triggers" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_inspection_requests" ADD CONSTRAINT "site_inspection_requests_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "site_inspection_requests_lead_id_unique" ON "site_inspection_requests" USING btree ("lead_id");