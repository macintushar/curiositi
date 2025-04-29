import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CHROMA_URL, CHROMA_COLLECTION_NAME } from "@/constants";
import { OllamaEmbeddingModel } from "@/tools/embeddings";

export const vectorStore = new Chroma(OllamaEmbeddingModel, {
  url: CHROMA_URL,
  collectionName: CHROMA_COLLECTION_NAME,
});
