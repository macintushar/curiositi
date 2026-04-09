import type { AIProvider } from "./types";
import {
	DEFAULT_MODELS,
	DEFAULT_TEMPERATURE,
	DEFAULT_MAX_TOKENS,
	DEFAULT_CONTEXT_WINDOW,
	MAX_TOOL_CALLS,
	DEFAULT_AGENT_NAME,
	DEFAULT_AGENT_DESCRIPTION,
	DEFAULT_SYSTEM_PROMPT,
	SUPPORTED_PROVIDERS,
	type SupportedProvider,
} from "@curiositi/share/models";

export {
	DEFAULT_TEMPERATURE,
	DEFAULT_MAX_TOKENS,
	DEFAULT_CONTEXT_WINDOW,
	MAX_TOOL_CALLS,
	DEFAULT_AGENT_NAME,
	DEFAULT_AGENT_DESCRIPTION,
	DEFAULT_SYSTEM_PROMPT,
	SUPPORTED_PROVIDERS,
};

export type { SupportedProvider };

export const MODEL_CONFIGS: Record<
	AIProvider,
	{
		default: string | null;
		models: string[];
		supportsVision: boolean;
		supportsFunctionCalling: boolean;
		requiresBaseUrl: boolean;
	}
> = {
	openai: {
		default: DEFAULT_MODELS.openai,
		models: [
			"openai/gpt-5.1",
			"openai/gpt-5-mini",
			"openai/gpt-5-nano",
			"openai/gpt-4o",
			"openai/o4-mini",
			"openai/o3-mini",
		],
		supportsVision: true,
		supportsFunctionCalling: true,
		requiresBaseUrl: false,
	},
	google: {
		default: DEFAULT_MODELS.google,
		models: [
			"google/gemini-3.1-pro-preview",
			"google/gemini-3-pro-preview",
			"google/gemini-3-flash-preview",
			"google/gemini-2.5-pro",
			"google/gemini-2.5-flash",
		],
		supportsVision: true,
		supportsFunctionCalling: true,
		requiresBaseUrl: false,
	},
	anthropic: {
		default: DEFAULT_MODELS.anthropic,
		models: [
			"anthropic/claude-opus-4-6",
			"anthropic/claude-sonnet-4-6",
			"anthropic/claude-opus-4-5",
			"anthropic/claude-sonnet-4-5",
			"anthropic/claude-haiku-4-5",
		],
		supportsVision: true,
		supportsFunctionCalling: true,
		requiresBaseUrl: false,
	},
	ollama: {
		default: null,
		models: [],
		supportsVision: false,
		supportsFunctionCalling: false,
		requiresBaseUrl: true,
	},
};

export const SUPPORTED_PROVIDERS_LIST = SUPPORTED_PROVIDERS;

export function getDefaultProvider(): AIProvider {
	if (process.env.OPENAI_API_KEY) return "openai";
	if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "google";
	if (process.env.ANTHROPIC_API_KEY) return "anthropic";
	if (process.env.OLLAMA_BASE_URL) return "ollama";
	return "openai";
}

export function getDefaultModelForProvider(provider: AIProvider): string {
	const config = MODEL_CONFIGS[provider];
	return config.default ?? config.models[0] ?? "";
}

export function getProviderApiKey(provider: AIProvider): string | undefined {
	switch (provider) {
		case "openai":
			return process.env.OPENAI_API_KEY;
		case "google":
			return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		case "anthropic":
			return process.env.ANTHROPIC_API_KEY;
		case "ollama":
			return undefined;
		default:
			return undefined;
	}
}

export function isProviderConfigured(provider: AIProvider): boolean {
	if (provider === "ollama") {
		return !!process.env.OLLAMA_BASE_URL;
	}
	return !!getProviderApiKey(provider);
}
