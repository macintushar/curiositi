import { files } from "@/db/schema";
import db from "@/db";

export async function addFileToDB(
  buffer: Buffer<ArrayBuffer>,
  name: string,
  type: string,
  fileSize: number,
) {
  try {
    const file = await db
      .insert(files)
      .values({
        name,
        type,
        file: buffer,
        file_size: fileSize.toString(),
      })
      .returning();

    return file;
  } catch (error) {
    console.error("Error adding file to DB:", error);
    throw error;
  }
}
