import type {
	Model,
	ModelsDevData,
	Provider,
	SupportedProvider,
} from "./types";
import bundledData from "./bundled.json";

export type {
	Model,
	Provider,
	ModelsDevData,
	SupportedProvider,
	AIProvider,
} from "./types";

// Use bundled data directly - filtered for supported providers only
const MODELS_DATA: ModelsDevData = bundledData as unknown as ModelsDevData;

export function getModelsDev(): ModelsDevData {
	return MODELS_DATA;
}

export function getProviders(): Provider[] {
	return Object.values(MODELS_DATA);
}

export function getModelsForProvider(providerId: string): Model[] {
	const provider = MODELS_DATA[providerId];
	if (!provider) return [];
	return Object.values(provider.models);
}

export function getModel(modelId: string): Model | null {
	const parts = modelId.split("/");
	const providerId = parts[0];
	if (!providerId) return null;
	const modelName = parts.slice(1).join("/");
	const models = getModelsForProvider(providerId);
	return models.find((m) => m.id === modelId || m.id === modelName) ?? null;
}

export function getProviderLogoUrl(providerId: string): string {
	return `https://models.dev/logos/${providerId}.svg`;
}

export function modelSupportsTools(model: Model): boolean {
	return model.tool_call === true;
}

export function modelSupportsVision(model: Model): boolean {
	return model.modalities.input.includes("image");
}

export function modelSupportsAttachments(model: Model): boolean {
	return model.attachment === true;
}

export function modelSupportsReasoning(model: Model): boolean {
	return model.reasoning === true;
}

export function calculateCost(
	model: Model,
	inputTokens: number,
	outputTokens: number,
	reasoningTokens = 0
): number {
	const inputCost = (inputTokens / 1_000_000) * model.cost.input;
	const outputCost = (outputTokens / 1_000_000) * model.cost.output;
	const reasoningCost =
		reasoningTokens > 0 && model.cost.reasoning
			? (reasoningTokens / 1_000_000) * model.cost.reasoning
			: 0;

	return inputCost + outputCost + reasoningCost;
}

export function formatCost(cost: number): string {
	if (cost < 0.01) {
		return `$${(cost * 100).toFixed(2)}c`;
	}
	return `$${cost.toFixed(2)}`;
}

export function formatTokens(tokens: number): string {
	if (tokens >= 1_000_000) {
		return `${(tokens / 1_000_000).toFixed(1)}M`;
	}
	if (tokens >= 1_000) {
		return `${(tokens / 1_000).toFixed(0)}K`;
	}
	return tokens.toString();
}

export function selectBestModel(models: Model[]): string | null {
	const scored = models
		.filter((m) => m.tool_call && !m.status)
		.map((m) => ({
			model: m,
			score: calculateModelScore(m),
		}))
		.sort((a, b) => b.score - a.score);

	return scored[0]?.model.id ?? null;
}

function calculateModelScore(model: Model): number {
	let score = 0;

	score += Math.min(model.limit.context / 100000, 10);

	score -= model.cost.input / 10;
	score -= model.cost.output / 10;

	const daysSinceUpdate =
		(Date.now() - new Date(model.last_updated).getTime()) / 86400000;
	score -= daysSinceUpdate / 30;

	if (model.tool_call) score += 5;
	if (model.attachment) score += 2;
	if (model.modalities.input.includes("image")) score += 2;

	return score;
}

export const SUPPORTED_PROVIDERS = [
	"openai",
	"google",
	"anthropic",
	"ollama",
] as const;

export const DEFAULT_MODELS: Record<SupportedProvider, string> = {
	openai: "openai/gpt-5-mini",
	google: "google/gemini-3-flash-preview",
	anthropic: "anthropic/claude-haiku-4-5",
	ollama: "",
};

export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_CONTEXT_WINDOW = 20;
export const MAX_TOOL_CALLS = 10;

export const DEFAULT_AGENT_NAME = "Curiositi Assistant";
export const DEFAULT_AGENT_DESCRIPTION =
	"Your AI assistant with access to your files and the web.";

export const DEFAULT_SYSTEM_PROMPT = `You are Curiositi, an intelligent assistant with access to the organization's files and the web.

You help users by:
- Answering questions based on their uploaded documents
- Searching the web for current information when needed
- Combining knowledge from both sources for comprehensive answers

When using tools:
- Prefer file search for questions about the user's content
- Use web search for current events or information not in files
- Always cite your sources when referencing specific content

Be helpful, accurate, and concise.`;

export const DEFAULTS = {
	AGENT_NAME: DEFAULT_AGENT_NAME,
	AGENT_DESCRIPTION: DEFAULT_AGENT_DESCRIPTION,
	SYSTEM_PROMPT: DEFAULT_SYSTEM_PROMPT,
	TEMPERATURE: DEFAULT_TEMPERATURE,
	MAX_TOKENS: DEFAULT_MAX_TOKENS,
	CONTEXT_WINDOW: DEFAULT_CONTEXT_WINDOW,
} as const;

export const PROVIDER_DEFAULTS: Record<
	SupportedProvider,
	{ modelId: string; modelName: string }
> = {
	openai: { modelId: "openai/gpt-5-mini", modelName: "gpt-5-mini" },
	google: {
		modelId: "google/gemini-3-flash-preview",
		modelName: "gemini-3-flash-preview",
	},
	anthropic: {
		modelId: "anthropic/claude-haiku-4-5",
		modelName: "claude-haiku-4-5",
	},
	ollama: { modelId: "", modelName: "" },
};

export function getProviderForModel(modelId: string): string {
	const parts = modelId.split("/");
	return parts[0] ?? "";
}

export function parseModelId(modelId: string): {
	provider: string;
	model: string;
} {
	const parts = modelId.split("/");
	return {
		provider: parts[0] ?? "",
		model: parts.slice(1).join("/"),
	};
}

export function isModelAvailable(modelId: string): boolean {
	const model = getModel(modelId);
	return model !== null;
}

export function getAvailableModelsForProvider(
	providerId: string,
	filters?: {
		requireTools?: boolean;
		requireVision?: boolean;
		requireAttachments?: boolean;
		minContext?: number;
	}
): Model[] {
	const models = getModelsForProvider(providerId);

	return models.filter((m) => {
		if (filters?.requireTools && !m.tool_call) return false;
		if (filters?.requireVision && !m.modalities.input.includes("image"))
			return false;
		if (filters?.requireAttachments && !m.attachment) return false;
		if (filters?.minContext && m.limit.context < filters.minContext)
			return false;
		if (m.status === "deprecated") return false;
		return true;
	});
}
