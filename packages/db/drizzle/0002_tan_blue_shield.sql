CREATE TYPE "public"."conversation_source" AS ENUM('web', 'slack');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system', 'tool');--> statement-breakpoint
CREATE TYPE "public"."model_provider" AS ENUM('openai', 'google', 'anthropic', 'ollama');--> statement-breakpoint
CREATE TYPE "public"."search_provider" AS ENUM('firecrawl', 'exa', 'webfetch');--> statement-breakpoint
CREATE TYPE "public"."tool_type" AS ENUM('builtin', 'mcp');--> statement-breakpoint
CREATE TABLE "curiositi_agent_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"tool_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curiositi_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" text NOT NULL,
	"created_by_id" text,
	"system_prompt" text NOT NULL,
	"max_tool_calls" integer DEFAULT 10 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "curiositi_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"title" text,
	"source" "conversation_source" NOT NULL,
	"organization_id" text NOT NULL,
	"created_by_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "curiositi_conversations_externalId_unique" UNIQUE("external_id")
);
--> statement-breakpoint
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
CREATE TABLE "curiositi_mcp_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"organization_id" text NOT NULL,
	"discovered_tools" integer DEFAULT 0,
	"last_connected_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "curiositi_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb,
	"tool_calls" jsonb,
	"token_count" integer,
	"cost_usd" real,
	"agent_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curiositi_organization_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
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
CREATE TABLE "curiositi_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_key" text,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"type" "tool_type" DEFAULT 'builtin' NOT NULL,
	"mcp_server_id" uuid,
	"organization_id" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_method" text;--> statement-breakpoint
ALTER TABLE "curiositi_agent_tools" ADD CONSTRAINT "curiositi_agent_tools_agent_id_curiositi_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."curiositi_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_agent_tools" ADD CONSTRAINT "curiositi_agent_tools_tool_id_curiositi_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."curiositi_tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_agents" ADD CONSTRAINT "curiositi_agents_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_agents" ADD CONSTRAINT "curiositi_agents_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_conversations" ADD CONSTRAINT "curiositi_conversations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_conversations" ADD CONSTRAINT "curiositi_conversations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_file_contents" ADD CONSTRAINT "curiositi_file_contents_file_id_curiositi_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."curiositi_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files" ADD CONSTRAINT "curiositi_files_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files" ADD CONSTRAINT "curiositi_files_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files_in_space" ADD CONSTRAINT "curiositi_files_in_space_file_id_curiositi_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."curiositi_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_files_in_space" ADD CONSTRAINT "curiositi_files_in_space_space_id_curiositi_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."curiositi_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_mcp_servers" ADD CONSTRAINT "curiositi_mcp_servers_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_messages" ADD CONSTRAINT "curiositi_messages_conversation_id_curiositi_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."curiositi_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_organization_settings" ADD CONSTRAINT "curiositi_organization_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_spaces" ADD CONSTRAINT "curiositi_spaces_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_spaces" ADD CONSTRAINT "curiositi_spaces_parent_space_id_curiositi_spaces_id_fk" FOREIGN KEY ("parent_space_id") REFERENCES "public"."curiositi_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_tools" ADD CONSTRAINT "curiositi_tools_mcp_server_id_curiositi_mcp_servers_id_fk" FOREIGN KEY ("mcp_server_id") REFERENCES "public"."curiositi_mcp_servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_tools" ADD CONSTRAINT "curiositi_tools_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_tool_agent_idx" ON "curiositi_agent_tools" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_tool_tool_idx" ON "curiositi_agent_tools" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "agent_organization_idx" ON "curiositi_agents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "agent_created_by_idx" ON "curiositi_agents" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "conversation_organization_idx" ON "curiositi_conversations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "conversation_external_idx" ON "curiositi_conversations" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "file_idx" ON "curiositi_file_contents" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "content_idx" ON "curiositi_file_contents" USING btree ("content");--> statement-breakpoint
CREATE INDEX "uploaded_by_idx" ON "curiositi_files" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "organization_idx" ON "curiositi_files" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "name_idx" ON "curiositi_files" USING btree ("name");--> statement-breakpoint
CREATE INDEX "space_idx" ON "curiositi_files_in_space" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "mcp_server_org_idx" ON "curiositi_mcp_servers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "curiositi_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_agent_idx" ON "curiositi_messages" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "org_settings_org_key_idx" ON "curiositi_organization_settings" USING btree ("organization_id","key");--> statement-breakpoint
CREATE INDEX "space_id_idx" ON "curiositi_spaces" USING btree ("id");--> statement-breakpoint
CREATE INDEX "space_organization_id_idx" ON "curiositi_spaces" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tool_organization_idx" ON "curiositi_tools" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tool_name_idx" ON "curiositi_tools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tool_key_idx" ON "curiositi_tools" USING btree ("tool_key");