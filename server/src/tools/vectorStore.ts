import {
  CHROMA_COLLECTION_NAME,
  CHROMA_URL,
  OLLAMA_EMBEDDING_MODEL,
} from "@/constants";
import { ChromaClient } from "chromadb";
import { ollama } from "./chat";

// Initialize the Chroma client
const client = new ChromaClient({ path: CHROMA_URL });

// Get or create the collection
export const getVectorStore = async () => {
  try {
    const collection = await client.getOrCreateCollection({
      name: CHROMA_COLLECTION_NAME,
    });
    return collection;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw error;
  }
};

// Helper function to generate embeddings using Ollama
export const generateEmbeddings = async (
  texts: string[],
): Promise<number[][]> => {
  try {
    const response = await ollama.embed({
      model: OLLAMA_EMBEDDING_MODEL,
      input: texts,
    });

    return response.embeddings;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
};
