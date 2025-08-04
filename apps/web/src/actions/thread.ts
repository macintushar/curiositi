"use server";

import { apiFetch } from "@/services/api";
import { deleteThread } from "@/services/thread";
import type { ApiResponse, Thread } from "@/types";

export async function createThread() {
  const res = await apiFetch<ApiResponse<Thread>>(`/api/v1/threads`, {
    method: "POST",
  });
  return res;
}

export async function deleteThreadAction(threadId: string) {
  return await deleteThread(threadId);
}
