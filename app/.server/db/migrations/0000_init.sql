CREATE TYPE "public"."application_status" AS ENUM('submitted', 'under_review', 'changes_requested', 'approved', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."author_role" AS ENUM('applier', 'approver');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('permission_letter', 'proposal', 'other');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('academic', 'talk', 'ceremony', 'workshop', 'competition', 'induction', 'other');--> statement-breakpoint
CREATE TYPE "public"."institute" AS ENUM('VIT', 'VSIT', 'VP', 'VIIE', 'VMMS');--> statement-breakpoint
CREATE TYPE "public"."message_kind" AS ENUM('comment', 'query', 'documents_requested', 'status_change');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('open', 'under_consideration', 'planned', 'declined');--> statement-breakpoint
CREATE TABLE "application_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"kind" "document_kind" DEFAULT 'other' NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_documents_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "application_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"kind" "message_kind" NOT NULL,
	"author_role" "author_role" NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"to_status" "application_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "applications_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"institute" "institute" NOT NULL,
	"type" "event_type" NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"purpose" text NOT NULL,
	"requirements" text,
	"equipment" text,
	"expected_attendees" integer,
	"livestream_requested" boolean DEFAULT false NOT NULL,
	"organizer" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_number_unique" UNIQUE("number"),
	CONSTRAINT "applications_within_hours" CHECK ("applications"."start_time" >= '07:00' AND "applications"."end_time" <= '19:00' AND "applications"."start_time" < "applications"."end_time")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"title" text NOT NULL,
	"institute" "institute" NOT NULL,
	"type" "event_type" NOT NULL,
	"organizer" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"equipment" text DEFAULT '' NOT NULL,
	"expected_attendees" integer,
	"livestream_requested" boolean DEFAULT false NOT NULL,
	"livestream_url" text,
	"outcome" text,
	"status" "event_status" DEFAULT 'confirmed' NOT NULL,
	"application_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "events_within_hours" CHECK ("events"."start_time" >= '07:00' AND "events"."end_time" <= '19:00' AND "events"."start_time" < "events"."end_time")
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"body" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"status" "suggestion_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_messages" ADD CONSTRAINT "application_messages_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_documents_app_idx" ON "application_documents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_messages_app_idx" ON "application_messages" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "applications_date_idx" ON "applications" USING btree ("date");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("date","start_time");--> statement-breakpoint
CREATE INDEX "suggestions_created_idx" ON "suggestions" USING btree ("created_at");