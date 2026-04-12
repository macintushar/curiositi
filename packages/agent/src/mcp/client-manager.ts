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

	private getEncryptionSecret(): string {
		const key = process.env.BETTER_AUTH_SECRET;
		if (!key) {
			throw new Error("BETTER_AUTH_SECRET must be configured");
		}
		return key;
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
			servers = await getActiveMcpServers(orgId, this.getEncryptionSecret());
		} catch (error) {
			logger.error(`[MCP] Failed to load servers for org ${orgId}:`, error);
			return;
		}

		const pendingClients = new Map<string, MCPClient>();

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

					if (this.orgs.get(orgId) !== entry) {
						await client.close();
						return;
					}

					pendingClients.set(server.id, client);
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

		if (this.orgs.get(orgId) !== entry) {
			for (const [id, client] of pendingClients) {
				try {
					await client.close();
				} catch (error) {
					logger.error(
						`[MCP] Error closing stale client ${id} (org: ${orgId}):`,
						error
					);
				}
			}
			return;
		}

		for (const [id, client] of pendingClients) {
			entry.clients.set(id, client);
		}

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
		this.orgs.delete(orgId);

		if (entry.initializing) {
			await entry.initializing.catch((error) => {
				logger.error(
					`[MCP] Initialization failed during shutdown for org ${orgId}:`,
					error
				);
			});
		}

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
	}
}

export const mcpClientManager = new MCPClientManager();
