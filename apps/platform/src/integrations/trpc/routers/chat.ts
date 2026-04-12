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
	getAgentsByOrganization,
	ensureDefaultAgents,
} from "@curiositi/db";
import { getAllSystemAgents } from "@curiositi/agent";

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
			})
		)
		.mutation(async ({ input, ctx }) => {
			const conversation = await createConversation({
				title: input.title,
				source: "web",
				organizationId: ctx.session.session.activeOrganizationId,
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
				agentId: z.string().optional(),
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
				agentId: input.agentId,
			});

			return { message };
		}),

	getAvailableAgents: protectedProcedure.query(async ({ ctx }) => {
		const orgId = ctx.session.session.activeOrganizationId;
		const dbAgents = await getAgentsByOrganization(orgId);
		if (dbAgents.length === 0) {
			await ensureDefaultAgents(orgId, ctx.session.user.id);
		}
		const systemAgents = getAllSystemAgents().map((sa) => ({
			...sa,
			description: sa.description,
			organizationId: "",
			createdById: null,
			isActive: true,
			createdAt: new Date(),
			updatedAt: null,
		}));
		const agents = [...systemAgents, ...dbAgents];
		return { agents };
	}),
} satisfies TRPCRouterRecord;

export default chatRouter;
