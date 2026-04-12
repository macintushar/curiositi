import db from "../client";
import { conversations, messages } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export async function getConversationById(conversationId: string) {
	const [conversation] = await db
		.select()
		.from(conversations)
		.where(eq(conversations.id, conversationId))
		.limit(1);

	return conversation ?? null;
}

export async function getConversationsByOrganization(organizationId: string) {
	return db
		.select()
		.from(conversations)
		.where(
			and(
				eq(conversations.organizationId, organizationId),
				eq(conversations.source, "web")
			)
		)
		.orderBy(desc(conversations.updatedAt));
}

export async function createConversation(data: {
	title?: string;
	source: "web" | "slack";
	organizationId: string;
	createdById: string;
	externalId?: string;
	metadata?: Record<string, unknown>;
}) {
	const [conversation] = await db
		.insert(conversations)
		.values({
			title: data.title ?? null,
			source: data.source,
			organizationId: data.organizationId,
			createdById: data.createdById,
			externalId: data.externalId ?? null,
			metadata: data.metadata ?? null,
		})
		.returning();

	return conversation;
}

export async function getMessagesByConversation(conversationId: string) {
	return db
		.select()
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(messages.createdAt);
}

export async function createMessage(data: {
	conversationId: string;
	role: "user" | "assistant" | "system" | "tool";
	content: string;
	attachments?: Record<string, unknown>[];
	toolCalls?: Record<string, unknown>[];
	tokenCount?: number;
	costUSD?: number;
	agentId?: string;
	metadata?: Record<string, unknown>;
}) {
	const [message] = await db
		.insert(messages)
		.values({
			conversationId: data.conversationId,
			role: data.role,
			content: data.content,
			attachments: data.attachments ?? null,
			toolCalls: data.toolCalls ?? null,
			tokenCount: data.tokenCount ?? null,
			costUSD: data.costUSD ?? null,
			agentId: data.agentId ?? null,
			metadata: data.metadata ?? null,
		})
		.returning();

	await db
		.update(conversations)
		.set({ updatedAt: new Date() })
		.where(eq(conversations.id, data.conversationId));

	return message;
}

export async function updateConversationTitle(
	conversationId: string,
	title: string
) {
	const [updated] = await db
		.update(conversations)
		.set({ title })
		.where(eq(conversations.id, conversationId))
		.returning();

	return updated;
}

export async function deleteConversation(conversationId: string) {
	await db.delete(conversations).where(eq(conversations.id, conversationId));
}
