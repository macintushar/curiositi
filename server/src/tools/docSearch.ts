import { getVectorStore, generateEmbeddings } from "@/lib/vectorStore";
import type { IncludeEnum } from "chromadb";

const MAX_RESULTS = 5;

const formatDocumentsWithMetadata = (
  documents: string[],
  metadatas: Array<Record<string, unknown>>,
  distances: number[] | null,
): string => {
  if (!documents || documents.length === 0) {
    return "No relevant documents found.";
  }

  return documents
    .slice(0, MAX_RESULTS)
    .map((content, i) => {
      const metadata = metadatas[i] || {};
      const source = metadata.source ? ` (Source: ${metadata.source})` : "";
      const score =
        distances && distances[i]
          ? ` [Relevance: ${(1 - distances[i]).toFixed(2)}]`
          : "";
      return `Document ${i + 1}${source}${score}:\n${content}\n`;
    })
    .join("\n---\n");
};

async function searchDocs(query: string, spaceId?: string): Promise<string> {
  console.log(
    `Searching documents for query: "${query}"${spaceId ? ` in space: ${spaceId}` : ""}`,
  );
  try {
    // Get the vector store collection
    const collection = await getVectorStore();

    // Generate embeddings for the query
    const queryEmbeddings = await generateEmbeddings([query]);
    if (!queryEmbeddings || queryEmbeddings.length === 0) {
      return "Error generating embeddings for the query.";
    }

    // Query parameters
    const queryParams: {
      queryEmbeddings: number[];
      nResults: number;
      include: IncludeEnum[];
      where?: { space_id: string };
    } = {
      queryEmbeddings: queryEmbeddings[0],
      nResults: MAX_RESULTS,
      include: ["documents", "metadatas", "distances"] as IncludeEnum[],
    };

    // Add filter by space_id if provided
    if (spaceId) {
      queryParams.where = { space_id: spaceId };
    }

    // Query the collection
    const results = await collection.query(queryParams);

    if (!results.documents || results.documents.length === 0) {
      return "No relevant documents found.";
    }

    return formatDocumentsWithMetadata(
      results.documents[0] as string[],
      (results.metadatas?.[0] as Array<Record<string, unknown>>) || [],
      (results.distances?.[0] as number[]) || null,
    );
  } catch (error: unknown) {
    console.error("Error searching documents:", error);

    if (error instanceof Error) {
      return `Error performing document search: ${error.message}`;
    }
    return "An unknown error occurred during document search.";
  }
}

export async function docSearchToolWithSpaceId(query: string, spaceId: string) {
  return searchDocs(query, spaceId);
}
