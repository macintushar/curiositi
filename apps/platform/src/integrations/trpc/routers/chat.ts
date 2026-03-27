import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../init";
import {
	getConversationById,
	getConversationsByOrganization,
	createConversation,
	getMessagesByConversation,
	createMessage,
	updateConversationTitle,
	deleteConversation,
} from "@curiositi/db";
import { getAgentById, ensureDefaultAgent } from "@curiositi/db";

import type { TRPCRouterRecord } from "@trpc/server";

const chatRouter = {
	getAllConversations: protectedProcedure.query(async ({ ctx }) => {
		const conversations = await getConversationsByOrganization(
			ctx.session.session.activeOrganizationId
		);
		return { conversations };
	}),

	getConversation: protectedProcedure
		.input(z.object({ conversationId: z.string() }))
		.query(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			const messages = await getMessagesByConversation(input.conversationId);
			return { conversation, messages };
		}),

	createConversation: protectedProcedure
		.input(
			z.object({
				title: z.string().max(200).optional(),
				agentId: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const agentId = input.agentId;
			if (agentId) {
				const agent = await getAgentById(agentId);
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
			}

			const defaultAgent = await ensureDefaultAgent(
				ctx.session.session.activeOrganizationId,
				ctx.session.user.id
			);

			const conversation = await createConversation({
				title: input.title,
				source: "web",
				organizationId: ctx.session.session.activeOrganizationId,
				agentId: agentId ?? defaultAgent.id,
				createdById: ctx.session.user.id,
			});

			return { conversation };
		}),

	updateTitle: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				title: z.string().min(1).max(200),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			const updated = await updateConversationTitle(
				input.conversationId,
				input.title
			);
			return { conversation: updated };
		}),

	deleteConversation: protectedProcedure
		.input(z.object({ conversationId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			await deleteConversation(input.conversationId);
			return { success: true };
		}),

	getMessages: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			})
		)
		.query(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			const messages = await getMessagesByConversation(input.conversationId);
			return { messages };
		}),

	addMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				role: z.enum(["user", "assistant", "system", "tool"]),
				content: z.string(),
				attachments: z.array(z.record(z.string(), z.unknown())).optional(),
				toolCalls: z.array(z.record(z.string(), z.unknown())).optional(),
				tokenCount: z.number().optional(),
				costUSD: z.number().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			const message = await createMessage({
				conversationId: input.conversationId,
				role: input.role,
				content: input.content,
				attachments: input.attachments,
				toolCalls: input.toolCalls,
				tokenCount: input.tokenCount,
				costUSD: input.costUSD,
			});

			return { message };
		}),

	getAgentForConversation: protectedProcedure
		.input(z.object({ conversationId: z.string() }))
		.query(async ({ input, ctx }) => {
			const conversation = await getConversationById(input.conversationId);
			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}
			if (
				conversation.organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this conversation",
				});
			}

			const agent = await getAgentById(conversation.agentId);
			if (!agent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}

			return { agent };
		}),
} satisfies TRPCRouterRecord;

export default chatRouter;
