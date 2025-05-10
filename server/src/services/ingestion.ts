import { SUPPORTED_FILE_TYPES } from "@/constants";
import { textSplitter } from "@/lib/utils";
import { getVectorStore, generateEmbeddings } from "@/lib/vectorStore";
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

    console.log(
      `Extracted text from ${originalFilename} (length: ${text.length}). Splitting...`,
    );

    const chunks = await textSplitter().splitText(text);
    console.log(`Split into ${chunks.length} chunks.`);

    if (chunks.length === 0) {
      console.warn(`No chunks generated for ${originalFilename}. Skipping.`);
      return;
    }

    // Create documents with metadata
    const documents = chunks;
    const ids = chunks.map(
      (_, index) => `${originalFilename}-${index}-${Date.now()}`,
    );
    const metadatas = chunks.map((_, index) => ({
      source: originalFilename,
      chunk_index: index,
    }));

    console.log(`Adding ${documents.length} document chunks to ChromaDB...`);

    // Generate embeddings for the chunks
    const embeddings = await generateEmbeddings(chunks);

    // Get the vector store and add the documents
    const collection = await getVectorStore();
    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents,
    });

    console.log(
      `Successfully processed and stored ${originalFilename} in ChromaDB.`,
    );
  } catch (error) {
    console.error(`Error processing file ${originalFilename}:`, error);
    throw new Error(`Failed to process file ${originalFilename}`);
  }
}
