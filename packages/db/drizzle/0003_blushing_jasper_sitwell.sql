DROP TYPE "public"."search_provider";--> statement-breakpoint
CREATE TYPE "public"."search_provider" AS ENUM('firecrawl', 'webfetch');--> statement-breakpoint
DROP INDEX "org_settings_org_key_idx";--> statement-breakpoint
ALTER TABLE "curiositi_messages" ALTER COLUMN "cost_usd" SET DATA TYPE numeric(18, 8);--> statement-breakpoint
ALTER TABLE "curiositi_messages" ALTER COLUMN "agent_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "curiositi_tools" ALTER COLUMN "tool_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "curiositi_messages" ADD CONSTRAINT "curiositi_messages_agent_id_curiositi_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."curiositi_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curiositi_agent_tools" ADD CONSTRAINT "agent_tool_unique" UNIQUE("agent_id","tool_id");--> statement-breakpoint
ALTER TABLE "curiositi_organization_settings" ADD CONSTRAINT "org_settings_org_key_unique" UNIQUE("organization_id","key");--> statement-breakpoint
ALTER TABLE "curiositi_tools" ADD CONSTRAINT "tool_key_org_unique" UNIQUE("tool_key","organization_id");