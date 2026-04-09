import type { QUEUE_PROVIDER } from "../constants";

export type S3Config = {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
};

export type JobType = "processFile";

export type ProcessFilePayload = {
	fileId: string;
	orgId: string;
};

export type JobPayload = {
	type: JobType;
	data: ProcessFilePayload;
};

export type QueueClient = {
	enqueue(payload: JobPayload): Promise<void>;
};

export type QstashConfig = {
	token: string;
	url?: string;
	workerUrl: string;
};

export type BunqueueConfig = {
	host: string;
	port: number;
};

export type QueueConfig =
	| { provider: QUEUE_PROVIDER.QSTASH; qstash: QstashConfig }
	| { provider: QUEUE_PROVIDER.LOCAL; bunqueue: BunqueueConfig };

export type { SearchResult } from "./search";

// System Agent types
export type ToolConfig = {
	name: string;
	enabled: boolean;
	config?: Record<string, unknown>;
};

export type SystemAgent = {
	id: string;
	name: string;
	description: string;
	systemPrompt: string;
	maxToolCalls: number;
	isDefault: boolean;
	tools: ToolConfig[];
};

// System Agent constants
export const SYSTEM_AGENTS: Record<string, SystemAgent> = {
	"system:ask": {
		id: "system:ask",
		name: "Ask",
		description: "General-purpose assistant for everyday questions and tasks.",
		systemPrompt:
			"You are a helpful AI assistant. Answer the user's questions to the best of your ability.",
		maxToolCalls: 10,
		isDefault: true,
		tools: [
			{ name: "fileSearch", enabled: true },
			{ name: "webSearch", enabled: true },
		],
	},
	"system:deep-research": {
		id: "system:deep-research",
		name: "Deep Research",
		description:
			"Thorough research agent that explores topics in depth, cites sources, and provides comprehensive analysis.",
		systemPrompt:
			"You are a research assistant. Provide thorough, well-researched answers with citations.",
		maxToolCalls: 100,
		isDefault: true,
		tools: [
			{ name: "fileSearch", enabled: true },
			{ name: "webSearch", enabled: true },
		],
	},
};

export const isSystemAgentId = (id: string): boolean => id in SYSTEM_AGENTS;

export const getSystemAgent = (id: string): SystemAgent | undefined =>
	SYSTEM_AGENTS[id];

export const getAllSystemAgents = (): SystemAgent[] =>
	Object.values(SYSTEM_AGENTS);

export const DEFAULT_SYSTEM_AGENT_ID = "system:ask" as const;
