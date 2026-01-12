import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { env } from "@worker/env";
import { embedMany } from "ai";
import { createOllama } from "ai-sdk-ollama";

type AIProvider = "openai" | "google" | "ollama";

export function model(name: AIProvider) {
	switch (name) {
		case "openai": {
			return openai.embedding("text-embedding-3-small");
		}
		case "google": {
			return google.embedding("gemini-embedding-001");
		}
		case "ollama": {
			return createOllama({ baseURL: env.OLLAMA_URL }).embedding("");
		}
	}
}

type EmbedChunksProps = {
	chunks: string[];
	provider: AIProvider;
};
export async function embedChunks({ chunks, provider }: EmbedChunksProps) {
	return await embedMany({
		model: model(provider),
		maxParallelCalls: 3,
		values: chunks,
		providerOptions: {
			openai: {
				dimensions: 1536,
			},
			google: {
				dimensions: 1536,
			},
			ollama: {
				dimensions: 1536,
			},
		},
	});
}
