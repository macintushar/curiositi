import { OLLAMA_BASE_URL } from "@/constants";
import { ChatOllama } from "@langchain/ollama";

export const OllamaChat = (model: string) =>
	new ChatOllama({
		baseUrl: OLLAMA_BASE_URL,
		model,
		temperature: 0.7,
	});
