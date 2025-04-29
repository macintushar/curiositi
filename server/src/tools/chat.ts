import { ChatOllama } from "@langchain/ollama";

export const OllamaChat = (model: string) =>
  new ChatOllama({
    model,
    temperature: 0.7,
  });
