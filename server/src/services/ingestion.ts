import { SUPPORTED_FILE_TYPES } from "@/constants";
import { textSplitter } from "@/lib/utils";
import {
  addDocumentsToVectorStore,
  generateEmbeddings,
} from "@/lib/vectorStore";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

async function extractTextFromPdf(fileBuffer: Buffer<ArrayBuffer>) {
  const file = new Blob([fileBuffer]);
  const loader = new WebPDFLoader(file, {
    splitPages: false,
    parsedItemSeparator: " ",
  });
  const docs = await loader.load();
  return docs[0].pageContent;
}

export async function processAndStoreDocument(
  fileBuffer: Buffer<ArrayBuffer>,
  originalFilename: string,
  mimeType: string,
  fileId: string,
  spaceId: string,
  userId: string,
): Promise<void> {
  console.log(`Processing ${originalFilename} (${mimeType})...`);

  let text = "";

  try {
    if (!SUPPORTED_FILE_TYPES.includes(mimeType)) {
      console.warn(
        `Unsupported file type: ${mimeType}. Skipping ${originalFilename}.`,
      );
      return;
    }

    if (mimeType === "application/pdf") {
      text = await extractTextFromPdf(fileBuffer);
    } else {
      text = fileBuffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      console.warn(`No text extracted from ${originalFilename}. Skipping.`);
      return;
    }

    const chunks = await textSplitter().splitText(text);

    if (chunks.length === 0) {
      console.warn(`No chunks generated for ${originalFilename}. Skipping.`);
      return;
    }

    // Generate embeddings for the chunks
    const embeddings = await generateEmbeddings(chunks);
    {
      chunks.forEach((chunk, index) => {
        addDocumentsToVectorStore(
          chunk,
          spaceId,
          fileId,
          userId,
          embeddings[index],
          originalFilename,
        );
      });
    }

    console.log(`Successfully processed and stored ${originalFilename}.`);
  } catch (error) {
    console.error(`Error processing file ${originalFilename}:`, error);
    throw new Error(`Failed to process file ${originalFilename}`);
  }
}
