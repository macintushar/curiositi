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
	ensureDefaultAgent,
} from "@curiositi/db";
import { getConversationsByAgent } from "@curiositi/db";
import {
	getModelsDev,
	getModelsForProvider,
	getModel,
} from "@curiositi/share/models";

import type { TRPCRouterRecord } from "@trpc/server";

const agentRouter = {
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const agents = await getAgentsByOrganization(
			ctx.session.session.activeOrganizationId
		);
		return { agents };
	}),

	getById: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.query(async ({ input, ctx }) => {
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

	getDefault: protectedProcedure.query(async ({ ctx }) => {
		const agent = await ensureDefaultAgent(
			ctx.session.session.activeOrganizationId,
			ctx.session.user.id
		);
		return { agent };
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().max(500).optional(),
				modelProvider: z.enum(["openai", "google", "anthropic", "ollama"]),
				modelId: z.string().min(1),
				systemPrompt: z.string().min(1),
				temperature: z.number().min(0).max(2).optional(),
				maxTokens: z.number().min(1).max(100000).optional(),
				contextWindow: z.number().min(1).max(100).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const agent = await createCustomAgent({
				name: input.name,
				description: input.description,
				organizationId: ctx.session.session.activeOrganizationId,
				createdById: ctx.session.user.id,
				modelProvider: input.modelProvider,
				modelId: input.modelId,
				systemPrompt: input.systemPrompt,
				temperature: input.temperature,
				maxTokens: input.maxTokens,
				contextWindow: input.contextWindow,
			});

			return { agent };
		}),

	update: protectedProcedure
		.input(
			z.object({
				agentId: z.string(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				modelProvider: z
					.enum(["openai", "google", "anthropic", "ollama"])
					.optional(),
				modelId: z.string().min(1).optional(),
				systemPrompt: z.string().min(1).optional(),
				temperature: z.number().min(0).max(2).optional(),
				maxTokens: z.number().min(1).max(100000).optional(),
				contextWindow: z.number().min(1).max(100).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
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

			const agent = await updateAgent(input.agentId, {
				name: input.name,
				description: input.description,
				modelProvider: input.modelProvider,
				modelId: input.modelId,
				systemPrompt: input.systemPrompt,
				temperature: input.temperature,
				maxTokens: input.maxTokens,
				contextWindow: input.contextWindow,
			});

			return { agent };
		}),

	delete: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.mutation(async ({ input, ctx }) => {
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
			if (agent.type === "default") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot delete the default agent",
				});
			}

			await deleteAgent(input.agentId);
			return { success: true };
		}),

	getConversations: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.query(async ({ input, ctx }) => {
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

			const conversations = await getConversationsByAgent(input.agentId);
			return { conversations };
		}),

	getTools: protectedProcedure
		.input(z.object({ agentId: z.string() }))
		.query(async ({ input, ctx }) => {
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
		.query(({ input }) => {
			if (input.provider) {
				const models = getModelsForProvider(input.provider);
				return { models };
			}
			const data = getModelsDev();
			const allModels = Object.values(data).flatMap((p) =>
				Object.values(p.models)
			);
			return { models: allModels };
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
