import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../init";
import {
	getAgentById,
	getAgentsByOrganization,
	createCustomAgent,
	updateAgent,
	deleteAgent,
	getToolsByOrganization,
	linkToolToAgent,
	unlinkToolFromAgent,
	bulkLinkToolsToAgent,
	ensureDefaultAgents,
	unlinkAllToolsFromAgent,
} from "@curiositi/db";
import {
	getModelsDev,
	getModelsForProvider,
	getModel,
} from "@curiositi/share/models";
import {
	isProviderConfigured,
	isSystemAgentId,
	getSystemAgent,
	getAllSystemAgents,
} from "@curiositi/agent";

import type { TRPCRouterRecord } from "@trpc/server";

function assertToolIdsBelongToOrganization(
	toolIds: string[] | undefined,
	organizationToolIds: Set<string>
) {
	if (!toolIds || toolIds.length === 0) {
		return;
	}

	const hasInvalidTool = toolIds.some(
		(toolId) => !organizationToolIds.has(toolId)
	);
	if (hasInvalidTool) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "One or more tools do not belong to this organization",
		});
	}
}

const agentRouter = {
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const dbAgents = await getAgentsByOrganization(
			ctx.session.session.activeOrganizationId
		);
		const systemAgents = getAllSystemAgents().map((sa) => ({
			...sa,
			description: sa.description,
			organizationId: "",
			createdById: null,
			isActive: true,
			createdAt: new Date(),
			updatedAt: null,
			toolCount: sa.tools.length,
		}));
		const agents = [...systemAgents, ...dbAgents];
		return { agents };
	}),

	getById: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.query(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				const systemAgent = getSystemAgent(input.agentId);
				if (!systemAgent) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Agent not found",
					});
				}
				return {
					agent: {
						...systemAgent,
						description: systemAgent.description,
						organizationId: "",
						createdById: null,
						isActive: true,
						createdAt: new Date(),
						updatedAt: null,
					},
				};
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}
			return { agent };
		}),

	ensureDefault: protectedProcedure.mutation(async ({ ctx }) => {
		const agents = await ensureDefaultAgents(
			ctx.session.session.activeOrganizationId,
			ctx.session.user.id
		);
		return { agents };
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().max(500).optional(),
				systemPrompt: z.string().min(1),
				maxToolCalls: z.number().min(1).max(200).optional(),
				toolIds: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const orgTools = await getToolsByOrganization(
				ctx.session.session.activeOrganizationId
			);
			const orgToolIds = new Set(orgTools.map((tool) => tool.id));
			assertToolIdsBelongToOrganization(input.toolIds, orgToolIds);

			const agent = await createCustomAgent({
				name: input.name,
				description: input.description,
				organizationId: ctx.session.session.activeOrganizationId,
				createdById: ctx.session.user.id,
				systemPrompt: input.systemPrompt,
				maxToolCalls: input.maxToolCalls,
			});

			if (input.toolIds && input.toolIds.length > 0) {
				await bulkLinkToolsToAgent(agent.id, input.toolIds);
			}

			return { agent };
		}),

	update: protectedProcedure
		.input(
			z.object({
				agentId: z.string(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				systemPrompt: z.string().min(1).optional(),
				maxToolCalls: z.number().min(1).max(200).optional(),
				toolIds: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot modify system agents",
				});
			}
			const existingAgent = await getAgentById(input.agentId);
			if (!existingAgent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (
				existingAgent.organizationId !==
				ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}

			const { toolIds, ...updateData } = input;
			const orgTools = await getToolsByOrganization(
				ctx.session.session.activeOrganizationId
			);
			const orgToolIds = new Set(orgTools.map((tool) => tool.id));
			assertToolIdsBelongToOrganization(toolIds, orgToolIds);

			const agent = await updateAgent(input.agentId, updateData);

			if (toolIds !== undefined) {
				await unlinkAllToolsFromAgent(input.agentId);
				if (toolIds.length > 0) {
					await bulkLinkToolsToAgent(input.agentId, toolIds);
				}
			}

			return { agent };
		}),

	delete: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot delete system agents",
				});
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}
			if (agent.isDefault) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot delete default agent",
				});
			}

			await deleteAgent(input.agentId);
			return { success: true };
		}),

	getTools: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.query(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				const systemAgent = getSystemAgent(input.agentId);
				if (!systemAgent) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Agent not found",
					});
				}
				return {
					tools: systemAgent.tools.map((t, i) => ({
						id: `system-tool-${i}`,
						agentId: systemAgent.id,
						toolId: t.name,
						enabled: t.enabled,
						priority: 0,
						config: t.config ?? {},
						tool: {
							id: t.name,
							name: t.name,
							displayName: t.name,
							description: t.name,
							type: "builtin",
							organizationId: "",
							isActive: true,
						},
					})),
				};
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}

			return { tools: agent.agentTools };
		}),

	linkTool: protectedProcedure
		.input(
			z.object({
				agentId: z.string(),
				toolId: z.string(),
				enabled: z.boolean().optional(),
				config: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot modify system agents",
				});
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}

			const orgTools = await getToolsByOrganization(
				ctx.session.session.activeOrganizationId
			);
			const orgToolIds = new Set(orgTools.map((tool) => tool.id));
			assertToolIdsBelongToOrganization([input.toolId], orgToolIds);

			const link = await linkToolToAgent(
				input.agentId,
				input.toolId,
				input.enabled ?? true,
				input.config
			);
			return { link };
		}),

	unlinkTool: protectedProcedure
		.input(
			z.object({
				agentId: z.string(),
				toolId: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot modify system agents",
				});
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}

			await unlinkToolFromAgent(input.agentId, input.toolId);
			return { success: true };
		}),

	bulkLinkTools: protectedProcedure
		.input(
			z.object({
				agentId: z.string(),
				toolIds: z.array(z.string()),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (isSystemAgentId(input.agentId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot modify system agents",
				});
			}
			const agent = await getAgentById(input.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}
			if (agent.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this agent",
				});
			}

			const orgTools = await getToolsByOrganization(
				ctx.session.session.activeOrganizationId
			);
			const orgToolIds = new Set(orgTools.map((tool) => tool.id));
			assertToolIdsBelongToOrganization(input.toolIds, orgToolIds);

			const links = await bulkLinkToolsToAgent(input.agentId, input.toolIds);
			return { links };
		}),

	getAvailableTools: protectedProcedure.query(async ({ ctx }) => {
		const tools = await getToolsByOrganization(
			ctx.session.session.activeOrganizationId
		);
		return { tools };
	}),

	getModels: protectedProcedure
		.input(
			z.object({
				provider: z
					.enum(["openai", "google", "anthropic", "ollama"])
					.optional(),
			})
		)
		.query(async ({ input }) => {
			const models = input.provider
				? getModelsForProvider(input.provider)
				: Object.values(getModelsDev()).flatMap((p) => Object.values(p.models));

			const providerStatuses = (
				["openai", "google", "anthropic", "ollama"] as const
			).map((provider) => ({
				provider,
				enabled: isProviderConfigured(provider),
			}));

			return { models, providerStatuses };
		}),

	getModelDetails: protectedProcedure
		.input(z.object({ modelId: z.string() }))
		.query(({ input }) => {
			const model = getModel(input.modelId);
			if (!model) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Model not found",
				});
			}
			return { model };
		}),
} satisfies TRPCRouterRecord;

export default agentRouter;
