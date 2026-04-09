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
} from "@curiositi/db";
import { discoverMcpTools } from "@curiositi/agent/mcp";
import { getAvailableTools } from "@curiositi/agent/tools";

const toolsRouter = {
	listBuiltIn: protectedProcedure.query(() => {
		return { tools: getAvailableTools() };
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
			const server = await createMcpServer({
				name: input.name,
				url: input.url,
				headers: input.headers,
				organizationId: ctx.session.session.activeOrganizationId,
			});
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
			const existing = await getMcpServerById(input.id);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "MCP server not found",
				});
			}
			if (
				existing.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this server",
				});
			}

			const { id, ...data } = input;
			const server = await updateMcpServer(id, data);
			return { server };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const existing = await getMcpServerById(input.id);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "MCP server not found",
				});
			}
			if (
				existing.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this server",
				});
			}

			await deleteMcpServer(input.id);
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
} satisfies TRPCRouterRecord;

export default toolsRouter;
