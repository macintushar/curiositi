import { files, spaces } from "@/db/schema";
import db from "@/db";
import { and, desc, eq } from "drizzle-orm";

export async function addFileToDB(
  buffer: Buffer<ArrayBuffer>,
  name: string,
  type: string,
  fileSize: number,
  spaceId: string,
  hash: string,
) {
  try {
    const isFileInSpace = await db
      .select()
      .from(files)
      .where(and(eq(files.hash, hash), eq(files.space_id, spaceId)));

    if (isFileInSpace.length > 0) {
      throw new Error("File already exists in space");
    }

    const file = await db
      .insert(files)
      .values({
        name,
        type,
        file: buffer,
        file_size: fileSize.toString(),
        space_id: spaceId,
        hash,
      })
      .returning({
        id: files.id,
        name: files.name,
        type: files.type,
        file_size: files.file_size,
        space_id: files.space_id,
      });

    return file;
  } catch (error) {
    console.error("Error adding file to DB:", error);
    throw error;
  }
}

export async function getFilesFromDB(spaceId: string) {
  try {
    const data = await db.query.files.findMany({
      columns: {
        id: true,
        name: true,
        type: true,
        file_size: true,
        space_id: true,
        created_at: true,
      },
      where: eq(files.space_id, spaceId),
    });
    return data;
  } catch (error) {
    console.error("Error getting files from DB:", error);
    throw error;
  }
}

export async function getFileFromDB(id: string, spaceId: string) {
  try {
    const file = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.space_id, spaceId)));
    return file;
  } catch (error) {
    console.error("Error getting file from DB:", error);
    throw error;
  }
}

export async function deleteFileFromDB(id: string, spaceId: string) {
  try {
    await db
      .delete(files)
      .where(and(eq(files.id, id), eq(files.space_id, spaceId)));
    return true;
  } catch (error) {
    console.error("Error deleting file from DB:", error);
    throw error;
  }
}

export async function addSpaceToDB(name: string) {
  try {
    const space = await db.insert(spaces).values({ name }).returning();
    return space;
  } catch (error) {
    console.error("Error adding space to DB:", error);
    throw error;
  }
}

export async function getSpacesFromDB() {
  try {
    const data = await db
      .select()
      .from(spaces)
      .orderBy(desc(spaces.updated_at));
    return data;
  } catch (error) {
    console.error("Error getting spaces from DB:", error);
    throw error;
  }
}

export async function getSpaceFromDB(id: string) {
  try {
    const data = await db.select().from(spaces).where(eq(spaces.id, id));
    return data;
  } catch (error) {
    console.error("Error getting space from DB:", error);
    throw error;
  }
}
