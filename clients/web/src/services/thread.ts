import type { ApiResponse, MessageResponse, Thread } from "@/types";
import { apiFetch } from "./api";
import { tryCatch } from "@/lib/utils";

export async function getThreads() {
  const res = await apiFetch<ApiResponse<Thread[]>>(`/api/v1/threads`);
  return res;
}

export async function deleteThread(threadId: string) {
  const res = await tryCatch(
    apiFetch<ApiResponse<MessageResponse>>(`/api/v1/threads/${threadId}`, {
      method: "DELETE",
    }),
  );
  return {
    data: res.data ?? null,
    error: res.error ?? null,
  };
}
