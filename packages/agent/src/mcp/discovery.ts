import { mcpClientManager } from "./client-manager";
import type { Tool } from "ai";

export async function discoverMcpTools(
	organizationId: string
): Promise<Record<string, Tool>> {
	try {
		return await mcpClientManager.getTools(organizationId);
	} catch (_error) {
		return {};
	}
}

export async function reloadMcpTools(organizationId: string): Promise<void> {
	await mcpClientManager.reload(organizationId);
}
