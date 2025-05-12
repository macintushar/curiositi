import {
  deleteFileFromDB,
  getFileFromDB,
  getFilesFromDB,
} from "@/services/queries";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
const filesRouter = new Hono();

filesRouter.get(
  "/:space_id",
  zValidator("param", z.object({ space_id: z.string() })),
  async (c) => {
    const { space_id } = await c.req.valid("param");
    const files = await getFilesFromDB(space_id);
    return c.json({ data: files });
  },
);

filesRouter.post(
  "/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = await c.req.valid("param");

    const fileResult = await getFileFromDB(id, space_id);

    if (fileResult.length === 0) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = fileResult[0];

    c.header("Content-Type", file.type);
    c.header("Content-Disposition", `attachment; filename="${file.name}"`);

    return c.body(file.file);
  },
);

filesRouter.delete(
  "/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = await c.req.valid("param");

    const deletedFile = await deleteFileFromDB(id, space_id);

    if (!deletedFile) {
      return c.json({ error: "File not found" }, 404);
    }

    return c.json({ data: { message: "File deleted successfully" } });
  },
);

export default filesRouter;
