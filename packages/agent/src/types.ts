import type { UIMessage } from "ai";
import type { SupportedProvider } from "@curiositi/share/models";

export type AIProvider = SupportedProvider;

export type ToolConfig = {
	name: string;
	enabled: boolean;
	config?: Record<string, unknown>;
};

export type AgentConfig = {
	id: string;
	name: string;
	description?: string;
	systemPrompt: string;
	maxToolCalls: number;
	tools: ToolConfig[];
	organizationId: string;
};

export type CreateAgentParams = {
	systemPrompt: string;
	maxToolCalls?: number;
	tools: ToolConfig[];
	organizationId: string;
};

export type FileSearchToolConfig = {
	maxResults?: number;
	minSimilarity?: number;
	searchSpaces?: string[] | "all";
	fileTypes?: string[];
	fileIds?: string[];
};

export type SearchProvider = "firecrawl" | "exa" | "webfetch";

export type WebSearchToolConfig = {
	provider?: SearchProvider;
	maxResults?: number;
	includeDomains?: string[];
	excludeDomains?: string[];
};

export type ConversationMessage = {
	role: "user" | "assistant" | "system" | "tool";
	content: string;
	attachments?: Attachment[];
	toolCalls?: ToolCall[];
	metadata?: Record<string, unknown>;
};

export type Attachment = {
	type: string;
	url?: string;
	name?: string;
	mimeType?: string;
	size?: number;
	data?: ArrayBuffer;
};

export type ToolCall = {
	id: string;
	name: string;
	args: Record<string, unknown>;
	result?: unknown;
};

export type AgentCosts = {
	inputTokens: number;
	outputTokens: number;
	reasoningTokens?: number;
	costUSD: number;
};

export type { UIMessage };
export type { SystemAgent } from "./system-agents";
