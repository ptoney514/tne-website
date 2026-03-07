ALTER TABLE "registrations" ADD COLUMN "parent_policy_accepted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "parent_policy_accepted_at" timestamp;