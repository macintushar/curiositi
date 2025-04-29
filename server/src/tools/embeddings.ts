import { OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL } from "@/constants";
import { OllamaEmbeddings } from "@langchain/ollama";

export const OllamaEmbeddingModel = new OllamaEmbeddings({
	model: OLLAMA_EMBEDDING_MODEL,
	baseUrl: OLLAMA_BASE_URL,
});
