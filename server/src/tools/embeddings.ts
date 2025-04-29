import { OllamaEmbeddings } from "@langchain/ollama";
import { OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL } from "@/constants";

export const OllamaEmbeddingModel = new OllamaEmbeddings({
  model: OLLAMA_EMBEDDING_MODEL,
  baseUrl: OLLAMA_BASE_URL,
});
