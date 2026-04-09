import { DEFAULT_SYSTEM_PROMPT, RESEARCH_AGENT_PROMPT } from "./prompts";
import type { ToolConfig } from "./types";

export type SystemAgent = {
	id: string;
	name: string;
	description: string;
	systemPrompt: string;
	maxToolCalls: number;
	isDefault: boolean;
	tools: ToolConfig[];
};

export const SYSTEM_AGENTS: Record<string, SystemAgent> = {
	"system:ask": {
		id: "system:ask",
		name: "Ask",
		description: "General-purpose assistant for everyday questions and tasks.",
		systemPrompt: DEFAULT_SYSTEM_PROMPT,
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
		systemPrompt: RESEARCH_AGENT_PROMPT,
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
