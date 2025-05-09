import { SUPPORTED_FILE_TYPES } from "@/constants";
import { processAndStoreDocument } from "@/services/ingestion";
import { UploadSchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const uploadRouter = new Hono();

uploadRouter.post("/", zValidator("form", UploadSchema), async (c) => {
  try {
    const formData = await c.req.valid("form");
    const file = formData.file;
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

    await processAndStoreDocument(fileBuffer, file.name, file.type);

    return c.json({
      data: {
        message: `File '${file.name}' processed successfully.`,
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
