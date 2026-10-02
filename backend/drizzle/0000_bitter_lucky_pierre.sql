CREATE TYPE "public"."lead_classification" AS ENUM('qualified', 'needs_clarification', 'site_inspection_likely', 'outside_service_area', 'priority_review');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('assessment', 'estimator', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'assigned', 'contact_attempted', 'customer_contacted', 'needs_clarification', 'site_inspection_recommended', 'inspection_scheduled', 'ready_for_quotation', 'converted', 'closed');--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"activity_type" varchar(80) NOT NULL,
	"message" text NOT NULL,
	"actor_name" varchar(160),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" varchar(32) NOT NULL,
	"source" "lead_source" NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"classification" "lead_classification" NOT NULL,
	"qualification_score" integer NOT NULL,
	"classification_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"customer_name" varchar(160) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(254),
	"service" varchar(120) DEFAULT 'LPG installation' NOT NULL,
	"city_municipality" varchar(160) NOT NULL,
	"barangay" varchar(160) NOT NULL,
	"address_line" text,
	"house_unit_number" varchar(80),
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"estimate" jsonb,
	"missing_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inspection_triggers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_to" uuid,
	"consented_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_activities_lead_id_idx" ON "lead_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");