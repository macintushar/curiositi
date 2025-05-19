import db from "@/db";
import { threads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getThreadsHandler(userId: string) {
  const userThreads = await db.query.threads.findMany({
    where: eq(threads.createdBy, userId),
  });
  return { data: userThreads };
}

export async function createThreadHandler(userId: string, spaceId?: string) {
  const newThread = await db
    .insert(threads)
    .values({
      createdBy: userId,
      spaceId: spaceId ?? null,
    })
    .returning();
  return { data: newThread };
}

export async function deleteThreadHandler(threadId: string) {
  const deletedThread = await db
    .delete(threads)
    .where(eq(threads.id, threadId));
  return {
    data: {
      message: deletedThread,
    },
  };
}
