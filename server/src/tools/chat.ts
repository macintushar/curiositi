import { HOST, OLLAMA_BASE_URL, OPENROUTER_API_KEY } from "@/constants";

import { Ollama } from "ollama";
import OpenAI from "openai";

export const ollama = new Ollama({
  host: OLLAMA_BASE_URL,
});

export const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
});

export const openrouter = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": HOST,
    "X-Title": "Curiositi",
  },
});
