import {
	streamText,
	stepCountIs,
	type ToolSet,
	type StreamTextOnFinishCallback,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ai-sdk-ollama";
import type { AIProvider, RunAgentParams } from "./types";

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

export type RunAgentOptions = {
	onFinish?: StreamTextOnFinishCallback<ToolSet>;
};

export function runAgent(params: RunAgentParams, options?: RunAgentOptions) {
	const { model, systemPrompt, messages, tools, maxToolCalls = 10 } = params;

	return streamText({
		model,
		system: systemPrompt,
		messages,
		tools: tools && Object.keys(tools).length > 0 ? tools : undefined,
		stopWhen: stepCountIs(maxToolCalls),
		onFinish: options?.onFinish,
	});
}
