import db from "@/db";
import { messages, threads } from "@/db/schema";
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

  if (deletedThread.rowCount === 1) {
    return {
      data: {
        message: "Thread deleted successfully.",
      },
    };
  }
}

export async function getThreadMessagesHandler(threadId: string) {
  const threadMessages = await db.query.messages.findMany({
    where: eq(messages.threadId, threadId),
  });
  return { data: threadMessages };
}
