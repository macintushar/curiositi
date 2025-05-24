import {
  OFFICE_FILE_TYPES,
  PDF_FILE_TYPE,
  SUPPORTED_FILE_TYPES,
} from "@/constants";
import { textSplitter } from "@/lib/utils";
import {
  addDocumentsToVectorStore,
  generateEmbeddings,
} from "@/lib/vectorStore";
import { tryCatch } from "@/lib/try-catch";

import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { parseOfficeAsync } from "officeparser";

async function extractTextFromPdf(fileBuffer: Buffer<ArrayBuffer>) {
  const file = new Blob([fileBuffer]);
  const loader = new WebPDFLoader(file, {
    splitPages: false,
    parsedItemSeparator: " ",
  });
  const docs = await loader.load();
  return docs[0].pageContent;
}

async function extractTextFromOffice(fileBuffer: Buffer<ArrayBuffer>) {
  const text = await parseOfficeAsync(fileBuffer);
  return text;
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

  const processFilePromise = async () => {
    let text = "";

    if (!SUPPORTED_FILE_TYPES.includes(mimeType)) {
      console.warn(
        `Unsupported file type: ${mimeType}. Skipping ${originalFilename}.`,
      );
      return;
    }

    if (mimeType === PDF_FILE_TYPE) {
      text = await extractTextFromPdf(fileBuffer);
    } else if (OFFICE_FILE_TYPES.includes(mimeType)) {
      text = await extractTextFromOffice(fileBuffer);
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
  };

  const { error } = await tryCatch(processFilePromise());

  if (error) {
    console.error(`Error processing file ${originalFilename}:`, error);
    throw new Error(`Failed to process file ${originalFilename}`);
  }
}
