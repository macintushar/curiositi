import { vectorStore } from "@/tools/vectorStore";
import type { Document } from "@langchain/core/documents";
import { DynamicTool } from "@langchain/core/tools";

const MAX_RESULTS = 5;

const formatDocumentsWithMetadata = (
  docs: Array<[Document, number]>,
): string => {
  if (!docs || docs.length === 0) {
    return "No relevant documents found.";
  }
  return docs
    .slice(0, MAX_RESULTS)
    .map(([doc, score], i) => {
      const metadata = doc.metadata || {};
      const source = metadata.source ? ` (Source: ${metadata.source})` : "";
      const scoreInfo = score ? ` [Relevance: ${score.toFixed(2)}]` : "";
      return `Document ${i + 1}${source}${scoreInfo}:\n${doc.pageContent}\n`;
    })
    .join("\n---\n");
};

async function searchDocs(query: string): Promise<string> {
  console.log(`Searching documents for query: "${query}"`);
  try {
    const results = await vectorStore.similaritySearchWithScore(query);
    return formatDocumentsWithMetadata(results);
  } catch (error: unknown) {
    console.error("Error searching documents:", error);

    if (error instanceof Error) {
      return `Error performing document search: ${error.message}`;
    }
    return "An unknown error occurred during document search.";
  }
}

export const docSearchTool = new DynamicTool({
  name: "document_search",
  description:
    "Search and retrieve relevant information from uploaded documents. Input should be a search query.",
  func: async (input: string) => {
    return searchDocs(input);
  },
});
