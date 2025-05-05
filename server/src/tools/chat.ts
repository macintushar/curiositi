import { HOST, OLLAMA_BASE_URL, OPENROUTER_API_KEY } from "@/constants";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export const OllamaChat = (model: string) =>
  new ChatOllama({
    baseUrl: OLLAMA_BASE_URL,
    model,
    temperature: 0.4,
  });

export const OpenRouterChat = (model: string) =>
  new ChatOpenAI({
    model: model,
    temperature: 0.4,
    apiKey: OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": HOST,
        "X-Title": "Curiositi",
      },
    },
  });
