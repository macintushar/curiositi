import { tool } from "ai";
import { z } from "zod";
import { embedText, type EmbeddingProvider } from "@curiositi/share/ai";
import { searchFileContents } from "@curiositi/db";
import type { AIProvider, FileSearchToolConfig } from "../types";

export type FileSearchParams = {
	query: string;
};

function getEmbeddingProvider(provider: AIProvider): EmbeddingProvider {
	if (provider === "openai" || provider === "google") {
		return provider;
	}
	return "openai";
}

export function createFileSearchTool(
	organizationId: string,
	provider: AIProvider,
	config: FileSearchToolConfig = {}
) {
	const {
		maxResults = 5,
		minSimilarity = 0.3,
		excerptLength = 1500,
		fileIds,
		searchSpaces,
	} = config;

	const spaceIds =
		searchSpaces && searchSpaces !== "all" ? searchSpaces : undefined;

	return tool({
		description: `Search through uploaded documents and files to find relevant information.
Use this when the user asks about content in their files or documents.
Returns relevant excerpts with source file names, sections, and page numbers.`,
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

				const results = await searchFileContents(
					organizationId,
					embedding,
					query,
					{
						maxResults,
						minSimilarity,
						fileIds,
						spaceIds,
					}
				);

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
						excerpt: r.content.slice(0, excerptLength),
						similarity: r.similarity,
						...(r.sectionTitle && { sectionTitle: r.sectionTitle }),
						...(r.pageNumber !== undefined && { pageNumber: r.pageNumber }),
						...(r.sheetName && { sheetName: r.sheetName }),
						...(r.rowStart !== undefined && { rowStart: r.rowStart }),
						...(r.rowEnd !== undefined && { rowEnd: r.rowEnd }),
						...(r.headers && { headers: r.headers }),
						...(r.slideNumber !== undefined && { slideNumber: r.slideNumber }),
						...(r.extractedVia && { extractedVia: r.extractedVia }),
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
