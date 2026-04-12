import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { getActiveMcpServers } from "@curiositi/db";
import type { Tool } from "ai";
import logger from "@curiositi/share/logger";

type OrgMcpEntry = {
	clients: Map<string, MCPClient>;
	initializing: Promise<void> | null;
	initialized: boolean;
};

class MCPClientManager {
	private orgs = new Map<string, OrgMcpEntry>();

	private getOrCreateEntry(orgId: string): OrgMcpEntry {
		let entry = this.orgs.get(orgId);
		if (!entry) {
			entry = { clients: new Map(), initializing: null, initialized: false };
			this.orgs.set(orgId, entry);
		}
		return entry;
	}

	async initialize(orgId: string): Promise<void> {
		const entry = this.getOrCreateEntry(orgId);
		if (entry.initialized) return;
		if (entry.initializing) {
			await entry.initializing;
			return;
		}

		entry.initializing = this._initialize(orgId, entry);
		try {
			await entry.initializing;
		} finally {
			entry.initializing = null;
		}
	}

	private async _initialize(orgId: string, entry: OrgMcpEntry): Promise<void> {
		let servers: Awaited<ReturnType<typeof getActiveMcpServers>>;
		try {
			servers = await getActiveMcpServers(orgId);
		} catch (error) {
			logger.error(`[MCP] Failed to load servers for org ${orgId}:`, error);
			return;
		}

		await Promise.allSettled(
			servers.map(async (server) => {
				try {
					const client = await createMCPClient({
						transport: {
							type: "sse",
							url: server.url,
							headers: (server.headers as Record<string, string>) ?? undefined,
						},
					});
					entry.clients.set(server.id, client);
					logger.info(
						`[MCP] Connected to server: ${server.name} (org: ${orgId})`
					);
				} catch (error) {
					logger.error(
						`[MCP] Failed to connect to server "${server.name}" (org: ${orgId}):`,
						error
					);
				}
			})
		);

		entry.initialized = true;
	}

	async getTools(orgId: string): Promise<Record<string, Tool>> {
		const entry = this.getOrCreateEntry(orgId);
		if (!entry.initialized) {
			await this.initialize(orgId);
		}

		const allTools: Record<string, Tool> = {};

		for (const [id, client] of entry.clients) {
			try {
				const tools = await client.tools();
				Object.assign(allTools, tools);
			} catch (error) {
				logger.error(
					`[MCP] Failed to list tools for client ${id} (org: ${orgId}):`,
					error
				);
			}
		}

		return allTools;
	}

	async reload(orgId: string): Promise<void> {
		await this.shutdown(orgId);
		await this.initialize(orgId);
	}

	async shutdown(orgId: string): Promise<void> {
		const entry = this.orgs.get(orgId);
		if (!entry) return;

		for (const [id, client] of entry.clients) {
			try {
				await client.close();
			} catch (error) {
				logger.error(
					`[MCP] Error closing client ${id} (org: ${orgId}):`,
					error
				);
			}
		}

		this.orgs.delete(orgId);
	}
}

export const mcpClientManager = new MCPClientManager();
