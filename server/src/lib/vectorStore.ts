import { DEFAULT_EMBEDDING_PROVIDER } from "@/constants";
import db from "@/db";
import { documents } from "@/db/schema";
import { llmEmbedding } from "@/lib/llms";
import { and, cosineDistance, eq, gt, sql } from "drizzle-orm";

export async function addDocumentsToVectorStore(
  chunk: string,
  spaceId: string,
  fileId: string,
  userId: string,
  embeddings: number[],
  filename: string,
) {
  const embeddedData = await db
    .insert(documents)
    .values({
      fileId: fileId,
      filename: filename,
      content: chunk,
      spaceId: spaceId,
      createdBy: userId,
      embedding: embeddings,
    })
    .returning();

  return embeddedData;
}

export async function getDocumentsFromVectorStore(
  spaceId: string,
  embedding: number[],
) {
  const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

  const docs = await db
    .select()
    .from(documents)
    .where(and(gt(similarity, 0.5), eq(documents.spaceId, spaceId)));

  return docs;
}

// Helper function to generate embeddings using Ollama
export const generateEmbeddings = async (
  texts: string[],
): Promise<number[][]> => {
  try {
    const embeddingModel = llmEmbedding(DEFAULT_EMBEDDING_PROVIDER);

    if (!embeddingModel) {
      throw new Error("Embedding model not found");
    }

    const response = await embeddingModel.doEmbed({
      values: texts,
    });

    return response.embeddings || [];
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
};
