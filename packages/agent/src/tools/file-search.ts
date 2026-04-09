import { tool } from "ai";
import { z } from "zod";
import { embedText, type EmbeddingProvider } from "@curiositi/share/ai";
import { searchFileContents } from "@curiositi/db";
import type { AIProvider, FileSearchToolConfig } from "../types";

export type FileSearchParams = {
	query: string;
};

function getEmbeddingProvider(provider: AIProvider): EmbeddingProvider {
	// Only openai and google support embeddings
	if (provider === "openai" || provider === "google") {
		return provider;
	}
	// Default to openai for providers without native embedding support
	return "openai";
}

export function createFileSearchTool(
	organizationId: string,
	provider: AIProvider,
	config: FileSearchToolConfig = {}
) {
	const { maxResults = 5, minSimilarity = 0.5, fileIds } = config;

	return tool({
		description: `Search through uploaded documents and files to find relevant information.
Use this when the user asks about content in their files or documents.
Returns relevant excerpts with source file names.`,
		inputSchema: z.object({
			query: z.string().describe("The search query to find relevant documents"),
		}),

		execute: async ({ query }: FileSearchParams) => {
			try {
				const embeddingProvider = getEmbeddingProvider(provider);
				const { embedding } = await embedText({
					text: query,
					provider: embeddingProvider,
				});

				const results = await searchFileContents(organizationId, embedding, {
					maxResults,
					minSimilarity,
					fileIds,
				});

				if (results.length === 0) {
					return {
						results: [],
						query,
						message:
							"No relevant documents found. Try a different search query.",
					};
				}

				return {
					results: results.map((r) => ({
						fileName: r.fileName,
						fileType: r.fileType,
						excerpt: r.content.slice(0, 500),
						similarity: r.similarity,
					})),
					query,
				};
			} catch (error) {
				console.error("File search error:", error);
				return {
					error:
						error instanceof Error ? error.message : "Failed to search files",
					results: [],
					query,
				};
			}
		},
	});
}

export function fileSearchTool(
	organizationId: string,
	provider: AIProvider,
	config: FileSearchToolConfig = {}
): ReturnType<typeof createFileSearchTool> {
	return createFileSearchTool(organizationId, provider, config);
}
