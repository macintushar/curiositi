import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const textSplitter = (chunkSize = 500, chunkOverlap = 50) =>
  new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
