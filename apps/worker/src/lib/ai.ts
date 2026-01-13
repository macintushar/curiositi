import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

type AIProvider = "openai" | "google";

export function model(name: AIProvider) {
	switch (name) {
		case "openai": {
			return openai.embedding("text-embedding-3-small");
		}
		case "google": {
			return google.embedding("gemini-embedding-001");
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
