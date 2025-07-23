import { SUPPORTED_FILE_TYPES } from "@/constants";
import { addFileToDB } from "@/services/queries";
import { processAndStoreDocument } from "@/services/ingestion";
import { createHash } from "crypto";
import { tryCatch } from "@/lib/try-catch";

type FileUpload = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export async function uploadFileHandler(
  file: FileUpload,
  spaceId: string,
  userId: string,
) {
  const processFilePromise = async () => {
    if (!file) {
      throw new Error("No file was uploaded or invalid file format");
    }

    const fileType = file.type.split(";")[0];

    console.log(
      `Received file: ${file.name} (${fileType}, size: ${file.size} bytes)`,
    );

    if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
      throw new Error(
        `Unsupported file type. Uploaded file type: ${fileType}. Only ${SUPPORTED_FILE_TYPES.join(
          ", ",
        )} are supported.`,
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");

    const fileUpload = await addFileToDB(
      fileBuffer,
      file.name,
      fileType,
      file.size,
      spaceId,
      fileHash,
    );

    await processAndStoreDocument(
      fileBuffer,
      file.name,
      fileType,
      fileUpload[0].id,
      spaceId,
      userId,
    );

    return {
      data: {
        message: `File '${file.name}' processed successfully.`,
        file: {
          id: fileUpload[0].id,
          name: fileUpload[0].name,
          type: fileUpload[0].type,
          size: fileUpload[0].fileSize,
          spaceId: fileUpload[0].spaceId,
          hash: fileHash,
        },
      },
    };
  };

  const { data, error } = await tryCatch(processFilePromise());

  if (error) {
    console.error("Error handling file upload:", error);
    let errorDetails = "Unknown error";
    if (error instanceof Error) {
      errorDetails = error.message;
    } else {
      errorDetails = String(error);
    }
    throw new Error(`Failed to process uploaded file: ${errorDetails}`);
  }

  return data;
}
