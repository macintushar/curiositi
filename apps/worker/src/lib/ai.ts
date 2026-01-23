import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { embedMany, generateText } from "ai";
import { IMAGE_DESCRIPTION_PROMPT } from "./prompts";

type AIProvider = "openai" | "google";

export function embeddingModel(name: AIProvider) {
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
		model: embeddingModel(provider),
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

export function textModel(name: AIProvider) {
	switch (name) {
		case "openai": {
			return openai("gpt-5-mini-2025-08-07");
		}
		case "google": {
			return google("gemini-3-flash-preview");
		}
	}
}

export async function describeImage({
	image,
	provider,
}: {
	image: string | Uint8Array | Buffer | ArrayBuffer | URL;
	provider: AIProvider;
}) {
	return await generateText({
		model: textModel(provider),
		messages: [
			{ role: "system", content: IMAGE_DESCRIPTION_PROMPT },
			{ role: "user", content: [{ type: "image", image }] },
		],
	});
}
