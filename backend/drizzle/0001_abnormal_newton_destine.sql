CREATE TABLE "call_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"checks" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"comments" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"call_summary" text DEFAULT '' NOT NULL,
	"updated_by" varchar(160) NOT NULL,
	"finalized_at" timestamp with time zone,
	"finalized_by" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_records" ADD CONSTRAINT "call_records_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "call_records_lead_id_unique" ON "call_records" USING btree ("lead_id");