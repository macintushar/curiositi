import { SUPPORTED_FILE_TYPES } from "@/constants";
import { processAndStoreDocument } from "@/services/ingestion";
import { addFileToDB } from "@/services/queries";
import { UploadSchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createHash } from "crypto";
const uploadRouter = new Hono();

uploadRouter.post("/", zValidator("form", UploadSchema), async (c) => {
  try {
    const { file, space_id } = await c.req.valid("form");

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
});

export default uploadRouter;
