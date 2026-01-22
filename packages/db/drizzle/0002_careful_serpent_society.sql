CREATE TYPE "public"."file_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "curiositi_file_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedded_content" vector(1536) NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "curiositi_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"type" text NOT NULL,
	"organization_id" text NOT NULL,
	"uploaded_by_id" text NOT NULL,
	"status" "file_status" DEFAULT 'pending' NOT NULL,
	"tags" jsonb DEFAULT '{"tags":[]}'::jsonb,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "curiositi_files_in_space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "curiositi_spaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"organization_id" text NOT NULL,
	"parent_space_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_method" text;--> statement-breakpoint
ALTER TABLE "curiositi_file_contents" ADD CONSTRAINT "curiositi_file_contents_file_id_curiositi_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."curiositi_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files" ADD CONSTRAINT "curiositi_files_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files" ADD CONSTRAINT "curiositi_files_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files_in_space" ADD CONSTRAINT "curiositi_files_in_space_file_id_curiositi_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."curiositi_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files_in_space" ADD CONSTRAINT "curiositi_files_in_space_space_id_curiositi_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."curiositi_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_spaces" ADD CONSTRAINT "curiositi_spaces_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_spaces" ADD CONSTRAINT "curiositi_spaces_parent_space_id_curiositi_spaces_id_fk" FOREIGN KEY ("parent_space_id") REFERENCES "public"."curiositi_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_idx" ON "curiositi_file_contents" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "content_idx" ON "curiositi_file_contents" USING btree ("content");--> statement-breakpoint
CREATE INDEX "uploaded_by_idx" ON "curiositi_files" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "organization_idx" ON "curiositi_files" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "name_idx" ON "curiositi_files" USING btree ("name");--> statement-breakpoint
CREATE INDEX "space_idx" ON "curiositi_files_in_space" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "space_id_idx" ON "curiositi_spaces" USING btree ("id");--> statement-breakpoint
CREATE INDEX "space_organization_id_idx" ON "curiositi_spaces" USING btree ("organization_id");