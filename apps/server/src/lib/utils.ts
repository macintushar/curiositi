import { Message } from "@/types";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const textSplitter = (chunkSize = 500, chunkOverlap = 50) =>
  new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

export const formatHistory = (history: Message[]) => {
  return history.map((message) => ({
    role: message.role,
    content: `Response: ${message.content}
    Document Searches: ${message.documentSearches}
    Web Searches: ${message.webSearches}
    Document Search Results: ${message.documentSearchResults}
    Web Search Results: ${message.webSearchResults}
    `,
  }));
};
