import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export type McpTransportType = "streamable-http" | "sse";

export class McpClient {
	private client: Client;
	private connected = false;
	private transportType: McpTransportType | null = null;

	constructor(
		private serverUrl: string,
		private headers?: Record<string, string>
	) {
		this.client = new Client(
			{ name: "curiositi", version: "0.0.1" },
			{ capabilities: {} }
		);
	}

	async connect() {
		if (this.connected) return;

		try {
			await this.tryStreamableHttp();
			this.transportType = "streamable-http";
		} catch {
			try {
				await this.trySse();
				this.transportType = "sse";
			} catch (error) {
				throw new Error(
					`Failed to connect via Streamable HTTP or SSE: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}
		}

		this.connected = true;
	}

	private async tryStreamableHttp() {
		const url = new URL(this.serverUrl);
		const transport = new StreamableHTTPClientTransport(url, {
			requestInit: {
				headers: this.headers as Record<string, string> | undefined,
			},
		});

		await this.client.connect(transport);
	}

	private async trySse() {
		const transport = new SSEClientTransport(new URL(this.serverUrl), {
			requestInit: {
				headers: this.headers as Record<string, string> | undefined,
			},
		});

		await this.client.connect(transport);
	}

	async disconnect() {
		if (!this.connected) return;
		await this.client.close();
		this.connected = false;
		this.transportType = null;
	}

	async listTools(): Promise<Tool[]> {
		if (!this.connected) {
			await this.connect();
		}
		const response = await this.client.listTools();
		return response.tools;
	}

	async callTool(name: string, args: Record<string, unknown>) {
		if (!this.connected) {
			await this.connect();
		}
		return this.client.callTool({ name, arguments: args });
	}

	isConnected() {
		return this.connected;
	}

	getTransportType() {
		return this.transportType;
	}
}
