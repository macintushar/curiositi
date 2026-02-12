import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany, generateText } from "ai";
import {
	DOCUMENT_EXTRACTION_PROMPT,
	IMAGE_DESCRIPTION_PROMPT,
} from "./prompts";

export type AIProvider = "openai" | "google";

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

type EmbedTextProps = {
	text: string;
	provider: AIProvider;
};

export async function embedText({ text, provider }: EmbedTextProps) {
	return await embed({
		model: embeddingModel(provider),
		value: text,
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

type ExtractDocumentTextProps = {
	file: ArrayBuffer;
	provider: AIProvider;
};

export async function extractDocumentText({
	file,
	provider,
}: ExtractDocumentTextProps) {
	return await generateText({
		model: textModel(provider),
		messages: [
			{ role: "system", content: DOCUMENT_EXTRACTION_PROMPT },
			{
				role: "user",
				content: [
					{
						type: "text",
						text: "Extract all text from this document:",
					},
					{
						type: "file",
						data: file,
						mediaType: "application/pdf",
					},
				],
			},
		],
	});
}
