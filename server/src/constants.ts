import { PromptTemplate } from "@langchain/core/prompts";

// Server
export const SERVER_PORT = process.env.SERVER_PORT || 3030;

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/dbname";

// Chroma
export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8090";
export const CHROMA_COLLECTION_NAME = "curiositi_docs";

// Ollama
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

// SearXNG
export const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8095";

// File Types

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain;charset=utf-8",
  "text/plain",
  "text/csv",
  "text/markdown",
];

// LangChain Prompts

export const QUERY_ANALYSIS_PROMPT = PromptTemplate.fromTemplate(
  `Analyze the following question and create an optimized search query.
Consider any specific requirements, filters, or constraints mentioned in the question.
Format your response to match the required schema.

Question: {question}

Generate a search query that will help find the most relevant information.`
);

export const CHAT_PROMPT_TEMPLATE =
  PromptTemplate.fromTemplate(`You are a knowledgeable AI assistant. Answer the question based on the following context and chat history. If the context doesn't contain enough information, acknowledge what you don't know.

Context:
{context}

Chat History:
{chat_history}

Current Question: {question}

Instructions:
1. Use only the provided context and chat history
2. If information is incomplete or uncertain, acknowledge it
3. Keep responses clear and concise
4. Reference previous conversations when relevant

Answer:`);
