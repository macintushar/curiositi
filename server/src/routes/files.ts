import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { UploadSchema } from "@/types/schemas";
import {
  getFilesHandler,
  getFileHandler,
  deleteFileHandler,
  getAllFilesHandler,
} from "@/services/files";
import { uploadFileHandler } from "@/services/upload";

const filesRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

filesRouter.post("/upload", zValidator("form", UploadSchema), async (c) => {
  const formData = await c.req.valid("form");

  const file = formData.file;
  const space_id = formData.space_id as string;

  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!file || typeof file === "string") {
    return c.json(
      {
        error: "Invalid file upload",
        details: "No file was uploaded or invalid file format",
      },
      400,
    );
  }

  const { data, error } = await tryCatch(
    uploadFileHandler(file, space_id, user.id),
  );
  if (error) {
    return c.json({ error: error.message || "File upload failed" }, 400);
  }
  return c.json(data);
});

filesRouter.get("/all", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await tryCatch(getAllFilesHandler(user.id));
  if (error) {
    return c.json({ error: error.message || "Failed to get files" }, 500);
  }
  return c.json(data);
});

filesRouter.get(
  "/:space_id",
  zValidator("param", z.object({ space_id: z.string() })),
  async (c) => {
    const { space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(getFilesHandler(space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to get files" }, 500);
    }
    return c.json(data);
  },
);

filesRouter.post(
  "/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(getFileHandler(id, space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to get file" }, 404);
    }
    c.header("Content-Type", data.contentType);
    c.header("Content-Disposition", `attachment; filename="${data.fileName}"`);
    return c.body(data.data);
  },
);

filesRouter.delete(
  "/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(deleteFileHandler(id, space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to delete file" }, 404);
    }
    return c.json(data);
  },
);

export default filesRouter;
