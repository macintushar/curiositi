import { files, spaces, user } from "@/db/schema";
import db from "@/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { tryCatch } from "@/lib/try-catch";

export async function addFileToDB(
  buffer: Buffer,
  name: string,
  type: string,
  fileSize: number,
  spaceId: string,
  hash: string,
) {
  const addFilePromise = async () => {
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
  };

  const { data, error } = await tryCatch(addFilePromise());

  if (error) {
    console.error("Error adding file to DB:", error);
    throw error;
  }

  return data;
}

export async function getFilesFromDB(spaceId: string) {
  const getFilesPromise = async () => {
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
  };

  const { data, error } = await tryCatch(getFilesPromise());

  if (error) {
    console.error("Error getting files from DB:", error);
    throw error;
  }

  return data;
}

export async function getAllUsersFilesFromDB(userId: string) {
  const getFilesPromise = async () => {
    const data = await db
      .select({
        id: files.id,
        name: files.name,
        type: files.type,
        fileSize: files.fileSize,
        spaceId: files.spaceId,
        createdAt: files.createdAt,
        spaceName: spaces.name,
        spaceIcon: spaces.icon,
      })
      .from(files)
      .innerJoin(spaces, eq(files.spaceId, spaces.id))
      .where(eq(spaces.createdBy, userId));
    return data;
  };

  const { data, error } = await tryCatch(getFilesPromise());

  if (error) {
    console.error("Error getting files from DB:", error);
    throw error;
  }

  return data;
}

export async function getFileFromDB(id: string, spaceId: string) {
  const getFilePromise = async () => {
    const file = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.spaceId, spaceId)));
    return file;
  };

  const { data, error } = await tryCatch(getFilePromise());

  if (error) {
    console.error("Error getting file from DB:", error);
    throw error;
  }

  return data;
}

export async function deleteFileFromDB(id: string, spaceId: string) {
  const deleteFilePromise = async () => {
    await db
      .delete(files)
      .where(and(eq(files.id, id), eq(files.spaceId, spaceId)));
    return true;
  };

  const { data, error } = await tryCatch(deleteFilePromise());

  if (error) {
    console.error("Error deleting file from DB:", error);
    throw error;
  }

  return data;
}

export async function addSpaceToDB(
  name: string,
  userId: string,
  icon: string | null,
  description: string | null,
) {
  const addSpacePromise = async () => {
    const space = await db
      .insert(spaces)
      .values({ name, createdBy: userId, icon, description })
      .returning();
    return space;
  };

  const { data, error } = await tryCatch(addSpacePromise());

  if (error) {
    console.error("Error adding space to DB:", error);
    throw error;
  }

  return data;
}

export async function getSpacesFromDB() {
  const getSpacesPromise = async () => {
    const data = await db
      .select({
        space: spaces,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        files: sql<number>`count(${files.id})::int`,
      })
      .from(spaces)
      .orderBy(desc(spaces.updatedAt))
      .leftJoin(user, eq(spaces.createdBy, user.id))
      .leftJoin(files, eq(spaces.id, files.spaceId))
      .groupBy(spaces.id, user.id, user.name, user.email, user.image);
    return data;
  };

  const { data, error } = await tryCatch(getSpacesPromise());

  if (error) {
    console.error("Error getting spaces from DB:", error);
    throw error;
  }

  return data;
}

export async function getSpaceFromDB(id: string) {
  const getSpacePromise = async () => {
    const data = await db
      .select({
        space: spaces,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(spaces)
      .where(eq(spaces.id, id))
      .leftJoin(user, eq(spaces.createdBy, user.id));
    return data;
  };

  const { data, error } = await tryCatch(getSpacePromise());

  if (error) {
    console.error("Error getting space from DB:", error);
    throw error;
  }

  return data[0];
}

export async function deleteSpaceFromDB(id: string) {
  const deleteSpacePromise = async () => {
    await db.delete(spaces).where(eq(spaces.id, id));
    return true;
  };

  const { data, error } = await tryCatch(deleteSpacePromise());

  if (error) {
    console.error("Error deleting space from DB:", error);
    throw error;
  }

  return data;
}

export async function updateSpaceInDB(
  id: string,
  name: string,
  icon: string | null,
  description: string | null,
  userId: string,
) {
  const updateSpacePromise = async () => {
    const space = await db
      .update(spaces)
      .set({ name, icon, description })
      .where(and(eq(spaces.id, id), eq(spaces.createdBy, userId)))
      .returning();
    return space;
  };

  const { data, error } = await tryCatch(updateSpacePromise());

  if (error) {
    console.error("Error updating space in DB:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Space not found");
  }

  return data;
}
