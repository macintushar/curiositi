import { CHROMA_COLLECTION_NAME, CHROMA_URL } from "@/constants";
import { OllamaEmbeddingModel } from "@/tools/embeddings";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export const vectorStore = new Chroma(OllamaEmbeddingModel, {
	url: CHROMA_URL,
	collectionName: CHROMA_COLLECTION_NAME,
});
