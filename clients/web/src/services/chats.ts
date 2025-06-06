import { tryCatch } from "@/lib/utils";

import type { ApiResponse, Thread, ThreadMessage } from "@/types";

import { apiFetch } from "./api";

export async function getThreads() {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<Thread[]>>("/api/v1/threads"),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
}

export async function getThreadMessages(threadId: string) {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<ThreadMessage[]>>(
      `/api/v1/threads/${threadId}/messages`,
      {
        method: "POST",
      },
    ),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
}
