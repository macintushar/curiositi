import { Hono } from "hono";
import { processAndStoreDocument } from "@/services/ingestion";
import { UploadSchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { SUPPORTED_FILE_TYPES } from "@/constants";

const uploadRoutes = new Hono();

uploadRoutes.post("/", zValidator("form", UploadSchema), async (c) => {
  try {
    const formData = await c.req.valid("form");
    const file = formData.file;

    console.log(
      `Received file: ${file.name} (${file.type}, size: ${file.size} bytes)`
    );

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return c.json(
        { error: "Unsupported file type. Only PDF and TXT are allowed." },
        415
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await processAndStoreDocument(fileBuffer, file.name, file.type);

    return c.json({ message: `File '${file.name}' processed successfully.` });
  } catch (error: any) {
    console.error("Error handling file upload:", error);
    return c.json(
      {
        error: "Failed to process uploaded file.",
        details: error.message || "Unknown error",
      },
      500
    );
  }
});

export default uploadRoutes;
