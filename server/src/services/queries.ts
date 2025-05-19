import { files, spaces, user } from "@/db/schema";
import db from "@/db";
import { and, desc, eq } from "drizzle-orm";

export async function addFileToDB(
  buffer: Buffer,
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
      .where(and(eq(files.hash, hash), eq(files.spaceId, spaceId)));

    if (isFileInSpace.length > 0) {
      throw new Error("File already exists in space");
    }

    const file = await db
      .insert(files)
      .values({
        name,
        type,
        file: buffer,
        fileSize: fileSize.toString(),
        spaceId,
        hash,
      })
      .returning({
        id: files.id,
        name: files.name,
        type: files.type,
        fileSize: files.fileSize,
        spaceId: files.spaceId,
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
        fileSize: true,
        spaceId: true,
        createdAt: true,
      },
      where: eq(files.spaceId, spaceId),
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
      .where(and(eq(files.id, id), eq(files.spaceId, spaceId)));
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
      .where(and(eq(files.id, id), eq(files.spaceId, spaceId)));
    return true;
  } catch (error) {
    console.error("Error deleting file from DB:", error);
    throw error;
  }
}

export async function addSpaceToDB(name: string, userId: string) {
  try {
    const space = await db
      .insert(spaces)
      .values({ name, createdBy: userId })
      .returning();
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
      .orderBy(desc(spaces.updatedAt))
      .leftJoin(user, eq(spaces.createdBy, user.id));
    return data;
  } catch (error) {
    console.error("Error getting spaces from DB:", error);
    throw error;
  }
}

export async function getSpaceFromDB(id: string) {
  try {
    const data = await db
      .select()
      .from(spaces)
      .where(eq(spaces.id, id))
      .leftJoin(user, eq(spaces.createdBy, user.id));
    return data;
  } catch (error) {
    console.error("Error getting space from DB:", error);
    throw error;
  }
}
