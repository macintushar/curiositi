import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../init";
import {
	getAllMcpServers,
	getMcpServerById,
	createMcpServer,
	updateMcpServer,
	deleteMcpServer,
	getToolsByOrganization,
	setToolActive,
} from "@curiositi/db";
import { discoverMcpTools, reloadMcpTools } from "@curiositi/agent/mcp";
import logger from "@curiositi/share/logger";

const toolsRouter = {
	listBuiltIn: protectedProcedure.query(async ({ ctx }) => {
		const orgId = ctx.session.session.activeOrganizationId;
		const orgTools = await getToolsByOrganization(orgId);
		const builtInTools = orgTools.filter((t) => t.type === "builtin");
		return { tools: builtInTools };
	}),

	list: protectedProcedure.query(async ({ ctx }) => {
		const servers = await getAllMcpServers(
			ctx.session.session.activeOrganizationId
		);
		return { servers };
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const server = await getMcpServerById(input.id);
			if (!server) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "MCP server not found",
				});
			}
			if (server.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this server",
				});
			}
			return { server };
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				url: z.string().url(),
				headers: z.record(z.string(), z.string()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			const server = await createMcpServer({
				name: input.name,
				url: input.url,
				headers: input.headers,
				organizationId: orgId,
			});
			reloadMcpTools(orgId).catch((err) =>
				logger.error("[MCP] Failed to reload tools after create:", err)
			);
			return { server };
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				url: z.string().url().optional(),
				headers: z.record(z.string(), z.string()).optional(),
				isActive: z.boolean().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			const existing = await getMcpServerById(input.id);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "MCP server not found",
				});
			}
			if (existing.organizationId !== orgId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this server",
				});
			}

			const { id, ...data } = input;
			const server = await updateMcpServer(id, data);
			reloadMcpTools(orgId).catch((err) =>
				logger.error("[MCP] Failed to reload tools after update:", err)
			);
			return { server };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			const existing = await getMcpServerById(input.id);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "MCP server not found",
				});
			}
			if (existing.organizationId !== orgId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this server",
				});
			}

			await deleteMcpServer(input.id);
			reloadMcpTools(orgId).catch((err) =>
				logger.error("[MCP] Failed to reload tools after delete:", err)
			);
			return { success: true };
		}),

	discoverTools: protectedProcedure.query(async ({ ctx }) => {
		const tools = await discoverMcpTools(
			ctx.session.session.activeOrganizationId
		);
		return {
			tools: Object.keys(tools).map((name) => ({
				name,
				source: "mcp",
			})),
		};
	}),

	toggleBuiltIn: protectedProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			const orgId = ctx.session.session.activeOrganizationId;
			const orgTools = await getToolsByOrganization(orgId);
			const tool = orgTools.find((t) => t.id === input.id);
			if (!tool) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tool not found",
				});
			}
			if (tool.type !== "builtin") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only built-in tools can be toggled this way",
				});
			}
			const updated = await setToolActive(input.id, input.isActive);
			return { tool: updated };
		}),
} satisfies TRPCRouterRecord;

export default toolsRouter;
