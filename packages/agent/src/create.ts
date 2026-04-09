import { ToolLoopAgent, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ai-sdk-ollama";
import type { CreateAgentParams, AIProvider } from "./types";
import { createTools } from "./tools";

export function getProviderModel(provider: AIProvider, modelName: string) {
	switch (provider) {
		case "openai":
			return openai(modelName);
		case "google":
			return google(modelName);
		case "anthropic":
			return anthropic(modelName);
		case "ollama": {
			const ollama = createOllama({
				baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
			});
			return ollama(modelName);
		}
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
}

export async function createAgent(
	params: CreateAgentParams & {
		model: ReturnType<typeof getProviderModel>;
		provider: AIProvider;
	}
) {
	const {
		model,
		provider,
		systemPrompt,
		maxToolCalls = 10,
		tools,
		organizationId,
	} = params;

	const agentTools = await createTools(organizationId, provider, tools);

	return new ToolLoopAgent({
		model,
		instructions: systemPrompt,
		tools: agentTools,
		stopWhen: stepCountIs(maxToolCalls),
	});
}
