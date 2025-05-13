import {
  getFilesFromDB,
  getFileFromDB,
  deleteFileFromDB,
} from "@/services/queries";
import { Context } from "hono";

export async function getFilesHandler(c: Context) {
  const { space_id } = c.req.param();
  const files = await getFilesFromDB(space_id);
  return c.json({ data: files });
}

export async function getFileHandler(c: Context) {
  const { id, space_id } = c.req.param();

  const fileResult = await getFileFromDB(id, space_id);

  if (fileResult.length === 0) {
    return c.json({ error: "File not found" }, 404);
  }

  const file = fileResult[0];

  c.header("Content-Type", file.type);
  c.header("Content-Disposition", `attachment; filename="${file.name}"`);

  return c.body(file.file);
}

export async function deleteFileHandler(c: Context) {
  const { id, space_id } = c.req.param();

  const deletedFile = await deleteFileFromDB(id, space_id);

  if (!deletedFile) {
    return c.json({ error: "File not found" }, 404);
  }

  return c.json({ data: { message: "File deleted successfully" } });
}
