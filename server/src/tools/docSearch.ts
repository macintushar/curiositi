import { documents } from "@/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import {
  getDocumentsFromVectorStore,
  generateEmbeddings,
} from "@/lib/vectorStore";

const formatDocumentsWithMetadata = (
  docs: InferSelectModel<typeof documents>[],
): string => {
  return docs
    .map((doc) => {
      return `Document ${doc.id} (${doc.filename}):\n${doc.content}\n`;
    })
    .join("\n---\n");
};

async function searchDocs(query: string, spaceId: string): Promise<string> {
  console.log(
    `Searching documents for query: "${query}"${spaceId ? ` in space: ${spaceId}` : ""}`,
  );

  try {
    // Generate embeddings for the query
    const queryEmbeddings = await generateEmbeddings([query]);
    if (
      !queryEmbeddings ||
      !Array.isArray(queryEmbeddings) ||
      queryEmbeddings.length === 0
    ) {
      throw new Error("Failed to generate valid embeddings for the query.");
    }

    // Query the collection
    const results = await getDocumentsFromVectorStore(
      spaceId,
      queryEmbeddings[0],
    );

    if (!results || results.length === 0) {
      return "No relevant documents found.";
    }

    return formatDocumentsWithMetadata(results);
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
