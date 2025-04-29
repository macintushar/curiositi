import { DynamicTool } from "@langchain/core/tools";
import { vectorStore } from "@/tools/vectorStore";
import { Document } from "@langchain/core/documents";

// Format documents with metadata and content
const formatDocumentsWithMetadata = (
  docs: Array<[Document, number]>
): string => {
  if (!docs || docs.length === 0) {
    return "No relevant documents found.";
  }
  return docs
    .map(([doc, score], i) => {
      const metadata = doc.metadata || {};
      const source = metadata.source ? ` (Source: ${metadata.source})` : "";
      const scoreInfo = score ? ` [Relevance: ${score.toFixed(2)}]` : "";
      return `Document ${i + 1}${source}${scoreInfo}:\n${doc.pageContent}\n`;
    })
    .join("\n---\n"); // Separator between documents
};

async function searchDocs(query: string, k: number = 4): Promise<string> {
  console.log(`Searching documents for query: "${query}", k=${k}`);
  try {
    const results = await vectorStore.similaritySearchWithScore(query, k);
    return formatDocumentsWithMetadata(results);
  } catch (error: any) {
    console.error("Error searching documents:", error);
    return `Error performing document search: ${error.message}`;
  }
}

export const docSearchTool = new DynamicTool({
  name: "document_search",
  description:
    "Search and retrieve relevant information from uploaded documents. Input should be a search query.",
  func: async (input: string | { query: string; k?: number }) => {
    let query: string;
    let k: number | undefined;

    if (typeof input === "string") {
      query = input;
    } else {
      query = input.query;
      k = input.k;
    }

    if (!query) {
      return "Error: Missing query for document search.";
    }

    return searchDocs(query, k);
  },
});
