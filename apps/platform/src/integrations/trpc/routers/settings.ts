import { z } from "zod";
import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../init";
import { getOrgSetting, setOrgSetting } from "@curiositi/db";

const modelsSettingsSchema = z.object({
	enabledModels: z.array(z.string()),
	defaultModel: z.string(),
});

const searchSettingsSchema = z.object({
	provider: z.enum(["firecrawl", "webfetch"]),
	maxResults: z.number().int().min(1).max(50),
	includeDomains: z.array(z.string()),
	excludeDomains: z.array(z.string()),
});

const settingsRouter = {
	getModels: protectedProcedure.query(async ({ ctx }) => {
		const orgId = ctx.session.session.activeOrganizationId;
		const setting = await getOrgSetting(orgId, "models");
		if (!setting) return null;
		const parsed = modelsSettingsSchema.safeParse(setting.value);
		return parsed.success ? parsed.data : null;
	}),

	setModels: protectedProcedure
		.input(modelsSettingsSchema)
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			await setOrgSetting(orgId, "models", input);
			return { success: true };
		}),

	getSearch: protectedProcedure.query(async ({ ctx }) => {
		const orgId = ctx.session.session.activeOrganizationId;
		const setting = await getOrgSetting(orgId, "search");
		if (!setting) return null;
		const parsed = searchSettingsSchema.safeParse(setting.value);
		return parsed.success ? parsed.data : null;
	}),

	setSearch: protectedProcedure
		.input(searchSettingsSchema)
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			await setOrgSetting(orgId, "search", input);
			return { success: true };
		}),
} satisfies TRPCRouterRecord;

export default settingsRouter;
