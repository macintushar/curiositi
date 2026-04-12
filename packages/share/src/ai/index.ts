import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany, generateText } from "ai";
import {
	DOCUMENT_EXTRACTION_PROMPT,
	IMAGE_DESCRIPTION_PROMPT,
} from "./prompts";

export type EmbeddingProvider = "openai" | "google";

export function embeddingModel(name: EmbeddingProvider) {
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
	provider: EmbeddingProvider;
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
		},
	});
}

type EmbedTextProps = {
	text: string;
	provider: EmbeddingProvider;
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
		},
	});
}

export function textModel(name: EmbeddingProvider) {
	switch (name) {
		case "openai": {
			return openai("gpt-4o-mini");
		}
		case "google": {
			return google("gemini-2.0-flash");
		}
	}
}

export async function describeImage({
	image,
	provider,
}: {
	image: string | Uint8Array | Buffer | ArrayBuffer | URL;
	provider: EmbeddingProvider;
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
	provider: EmbeddingProvider;
	mediaType?: string;
};

export async function extractDocumentText({
	file,
	provider,
	mediaType = "application/pdf",
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
						mediaType,
					},
				],
			},
		],
	});
}
