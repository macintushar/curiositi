import { ChatOllama } from "@langchain/ollama";
import { OLLAMA_BASE_URL } from "@/constants";

export const OllamaChat = (model: string) =>
  new ChatOllama({
    baseUrl: OLLAMA_BASE_URL,
    model,
    temperature: 0.7,
  });
