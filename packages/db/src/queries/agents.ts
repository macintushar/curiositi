import db from "../client";
import { agents, agentTools, tools } from "../schema";
import { eq, and, or, desc, count } from "drizzle-orm";

export type AgentWithTools = typeof agents.$inferSelect & {
	agentTools: (typeof agentTools.$inferSelect & {
		tool: typeof tools.$inferSelect | null;
	})[];
};

async function fetchAgentWithTools(
	agent: typeof agents.$inferSelect
): Promise<AgentWithTools> {
	const agentToolsList = await db
		.select()
		.from(agentTools)
		.where(eq(agentTools.agentId, agent.id))
		.leftJoin(tools, eq(agentTools.toolId, tools.id));

	return {
		...agent,
		agentTools: agentToolsList.map((at) => ({
			...at.agent_tools,
			tool: at.tools,
		})),
	};
}

export async function getAgentById(
	agentId: string
): Promise<AgentWithTools | null> {
	const [agent] = await db
		.select()
		.from(agents)
		.where(eq(agents.id, agentId))
		.limit(1);

	if (!agent) return null;

	return fetchAgentWithTools(agent);
}

export async function getAgentsByOrganization(organizationId: string) {
	const agentList = await db
		.select()
		.from(agents)
		.where(
			and(eq(agents.organizationId, organizationId), eq(agents.isActive, true))
		)
		.orderBy(desc(agents.createdAt));

	const toolCounts = await db
		.select({
			agentId: agentTools.agentId,
			toolCount: count(),
		})
		.from(agentTools)
		.innerJoin(agents, eq(agentTools.agentId, agents.id))
		.where(eq(agents.organizationId, organizationId))
		.groupBy(agentTools.agentId);

	const toolCountMap = new Map<string, number>();
	for (const tc of toolCounts) {
		toolCountMap.set(tc.agentId, tc.toolCount);
	}

	return agentList.map((agent) => ({
		...agent,
		toolCount: toolCountMap.get(agent.id) ?? 0,
	}));
}

export async function getDefaultAgent(
	organizationId: string
): Promise<AgentWithTools | null> {
	const [agent] = await db
		.select()
		.from(agents)
		.where(
			and(
				eq(agents.organizationId, organizationId),
				eq(agents.isActive, true),
				eq(agents.isDefault, true)
			)
		)
		.limit(1);

	if (!agent) return null;

	return fetchAgentWithTools(agent);
}

export async function getFirstAvailableAgent(
	organizationId: string
): Promise<AgentWithTools | null> {
	const [agent] = await db
		.select()
		.from(agents)
		.where(
			and(eq(agents.organizationId, organizationId), eq(agents.isActive, true))
		)
		.orderBy(desc(agents.createdAt))
		.limit(1);

	if (!agent) return null;

	return fetchAgentWithTools(agent);
}

export async function createCustomAgent(data: {
	name: string;
	description?: string;
	organizationId: string;
	createdById: string;
	systemPrompt: string;
	maxToolCalls?: number;
	isDefault?: boolean;
}) {
	const [agent] = await db
		.insert(agents)
		.values({
			name: data.name,
			description: data.description ?? null,
			organizationId: data.organizationId,
			createdById: data.createdById,
			systemPrompt: data.systemPrompt,
			maxToolCalls: data.maxToolCalls ?? 10,
			isDefault: data.isDefault ?? false,
			isActive: true,
		})
		.returning();

	return agent;
}

export async function updateAgent(
	agentId: string,
	data: Partial<{
		name: string;
		description: string;
		systemPrompt: string;
		maxToolCalls: number;
		isActive: boolean;
	}>
) {
	const [updated] = await db
		.update(agents)
		.set(data)
		.where(eq(agents.id, agentId))
		.returning();
	return updated;
}

export async function deleteAgent(agentId: string) {
	const [agent] = await db
		.select()
		.from(agents)
		.where(eq(agents.id, agentId))
		.limit(1);

	if (agent?.isDefault) {
		throw new Error("Cannot delete default agent");
	}

	await db
		.update(agents)
		.set({ isActive: false })
		.where(eq(agents.id, agentId));
}

export async function createDefaultTools(organizationId: string) {
	const [existingFileSearchTool] = await db
		.select()
		.from(tools)
		.where(
			and(
				eq(tools.organizationId, organizationId),
				or(eq(tools.toolKey, "fileSearch"), eq(tools.name, "fileSearch")),
				eq(tools.isActive, true)
			)
		)
		.limit(1);

	if (existingFileSearchTool && !existingFileSearchTool.toolKey) {
		await db
			.update(tools)
			.set({ toolKey: "fileSearch" })
			.where(eq(tools.id, existingFileSearchTool.id));
	}

	const fileSearchTool =
		existingFileSearchTool ??
		(
			await db
				.insert(tools)
				.values({
					toolKey: "fileSearch",
					name: "fileSearch",
					displayName: "File Search",
					description:
						"Search through uploaded documents and files to find relevant information.",
					type: "builtin",
					organizationId,
					config: {
						maxResults: 5,
						minSimilarity: 0.5,
						searchSpaces: "all",
						fileTypes: [],
					},
					isActive: true,
				})
				.returning()
		)[0];

	const [existingWebSearchTool] = await db
		.select()
		.from(tools)
		.where(
			and(
				eq(tools.organizationId, organizationId),
				or(eq(tools.toolKey, "webSearch"), eq(tools.name, "webSearch")),
				eq(tools.isActive, true)
			)
		)
		.limit(1);

	if (existingWebSearchTool && !existingWebSearchTool.toolKey) {
		await db
			.update(tools)
			.set({ toolKey: "webSearch" })
			.where(eq(tools.id, existingWebSearchTool.id));
	}

	const webSearchTool =
		existingWebSearchTool ??
		(
			await db
				.insert(tools)
				.values({
					toolKey: "webSearch",
					name: "webSearch",
					displayName: "Web Search",
					description:
						"Search the web for current information when not found in uploaded files.",
					type: "builtin",
					organizationId,
					config: { provider: "firecrawl", maxResults: 5 },
					isActive: true,
				})
				.returning()
		)[0];

	return { fileSearchTool, webSearchTool };
}

export async function getToolsByOrganization(organizationId: string) {
	return db
		.select()
		.from(tools)
		.where(
			and(eq(tools.organizationId, organizationId), eq(tools.isActive, true))
		)
		.orderBy(desc(tools.createdAt));
}

export async function linkToolToAgent(
	agentId: string,
	toolId: string,
	enabled = true,
	config?: Record<string, unknown>
) {
	const [existingLink] = await db
		.select()
		.from(agentTools)
		.where(and(eq(agentTools.agentId, agentId), eq(agentTools.toolId, toolId)))
		.limit(1);

	if (existingLink) {
		return existingLink;
	}

	const [link] = await db
		.insert(agentTools)
		.values({
			agentId,
			toolId,
			enabled,
			config: config ?? {},
			priority: 0,
		})
		.returning();
	return link;
}

export async function unlinkToolFromAgent(agentId: string, toolId: string) {
	await db
		.delete(agentTools)
		.where(and(eq(agentTools.agentId, agentId), eq(agentTools.toolId, toolId)));
}

export async function bulkLinkToolsToAgent(
	agentId: string,
	toolIds: string[],
	config?: Record<string, unknown>
) {
	const uniqueToolIds = Array.from(new Set(toolIds));
	const links = await Promise.all(
		uniqueToolIds.map((toolId) =>
			linkToolToAgent(agentId, toolId, true, config)
		)
	);
	return links;
}

export async function setupOrganization(orgId: string, _userId: string) {
	await createDefaultTools(orgId);
}

export async function ensureDefaultAgents(orgId: string, userId: string) {
	await setupOrganization(orgId, userId);
	return getAgentsByOrganization(orgId);
}

export async function unlinkAllToolsFromAgent(agentId: string) {
	await db.delete(agentTools).where(eq(agentTools.agentId, agentId));
}
