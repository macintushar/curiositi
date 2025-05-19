import { SUPPORTED_FILE_TYPES } from "@/constants";
import { addFileToDB } from "@/services/queries";
import { processAndStoreDocument } from "@/services/ingestion";
import { createHash } from "crypto";
import { Context } from "hono";

interface FileUpload {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export async function uploadFileHandler(c: Context) {
  try {
    const formData = await c.req.parseBody();
    const file = formData.file as FileUpload;
    const space_id = formData.space_id as string;

    if (!file || typeof file === "string") {
      return c.json(
        {
          error: "Invalid file upload",
          details: "No file was uploaded or invalid file format",
        },
        400,
      );
    }

    const fileType = file.type.split(";")[0];

    console.log(
      `Received file: ${file.name} (${fileType}, size: ${file.size} bytes)`,
    );

    if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
      return c.json(
        {
          error: "Unsupported file type.",
          details: `Uploaded file type: ${fileType}. Only ${SUPPORTED_FILE_TYPES.join(
            ", ",
          )} are supported.`,
        },
        415,
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");

    const fileUpload = await addFileToDB(
      fileBuffer,
      file.name,
      fileType,
      file.size,
      space_id,
      fileHash,
    );

    await processAndStoreDocument(
      fileBuffer,
      file.name,
      fileType,
      fileUpload[0].id,
      space_id,
      user_id,
    );

    return c.json({
      data: {
        message: `File '${file.name}' processed successfully.`,
        file: {
          id: fileUpload[0].id,
          name: fileUpload[0].name,
          type: fileUpload[0].type,
          size: fileUpload[0].file_size,
          space_id: fileUpload[0].space_id,
          hash: fileHash,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error handling file upload:", error);
    let errorDetails = "Unknown error";
    if (error instanceof Error) {
      errorDetails = error.message;
    } else {
      errorDetails = String(error);
    }
    return c.json(
      {
        error: "Failed to process uploaded file.",
        details: errorDetails,
      },
      500,
    );
  }
}
