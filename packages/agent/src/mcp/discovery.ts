import { getActiveMcpServers } from "@curiositi/db";
import { McpClient } from "./client";
import { adaptMcpTool } from "./tool-adapter";
import type { Tool } from "ai";

export async function discoverMcpTools(
	organizationId: string
): Promise<Record<string, Tool>> {
	const tools: Record<string, Tool> = {};

	try {
		const servers = await getActiveMcpServers(organizationId);

		for (const server of servers) {
			try {
				const client = new McpClient(
					server.url,
					server.headers as Record<string, string> | undefined
				);

				await client.connect();
				const mcpTools = await client.listTools();

				for (const mcpTool of mcpTools) {
					const toolKey = `${server.name}_${mcpTool.name}`;
					tools[toolKey] = adaptMcpTool(client, mcpTool);
				}
			} catch (error) {
				console.error(`Failed to connect to MCP server ${server.name}:`, error);
			}
		}
	} catch (error) {
		console.error("Failed to discover MCP tools:", error);
	}

	return tools;
}
