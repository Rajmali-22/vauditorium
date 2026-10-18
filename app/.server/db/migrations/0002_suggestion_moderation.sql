ALTER TYPE "public"."suggestion_status" ADD VALUE IF NOT EXISTS 'hidden';--> statement-breakpoint
ALTER TABLE "suggestions" ADD COLUMN IF NOT EXISTS "sender_hash" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suggestions_sender_idx" ON "suggestions" USING btree ("sender_hash","created_at");
