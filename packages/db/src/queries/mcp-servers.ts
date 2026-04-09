import db from "../client";
import { mcpServers } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export async function getActiveMcpServers(organizationId: string) {
	return db
		.select()
		.from(mcpServers)
		.where(
			and(
				eq(mcpServers.organizationId, organizationId),
				eq(mcpServers.isActive, true)
			)
		)
		.orderBy(desc(mcpServers.createdAt));
}

export async function getAllMcpServers(organizationId: string) {
	return db
		.select()
		.from(mcpServers)
		.where(eq(mcpServers.organizationId, organizationId))
		.orderBy(desc(mcpServers.createdAt));
}

export async function getMcpServerById(id: string) {
	const [server] = await db
		.select()
		.from(mcpServers)
		.where(eq(mcpServers.id, id))
		.limit(1);
	return server ?? null;
}

export async function createMcpServer(data: {
	name: string;
	url: string;
	headers?: Record<string, string>;
	organizationId: string;
}) {
	const [server] = await db
		.insert(mcpServers)
		.values({
			name: data.name,
			url: data.url,
			headers: data.headers ?? {},
			organizationId: data.organizationId,
			isActive: true,
		})
		.returning();
	return server;
}

export async function updateMcpServer(
	id: string,
	data: Partial<{
		name: string;
		url: string;
		headers: Record<string, string>;
		isActive: boolean;
		discoveredTools: number;
		lastConnectedAt: Date;
	}>
) {
	const [updated] = await db
		.update(mcpServers)
		.set(data)
		.where(eq(mcpServers.id, id))
		.returning();
	return updated;
}

export async function deleteMcpServer(id: string) {
	await db
		.update(mcpServers)
		.set({ isActive: false })
		.where(eq(mcpServers.id, id));
}
