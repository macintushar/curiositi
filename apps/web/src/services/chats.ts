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
        method: "GET",
      },
    ),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
}

export async function sendMessage(
  input: string,
  model: string,
  provider: string,
  thread_id: string,
  space_ids: string[],
  file_ids: string[],
) {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<ThreadMessage>>(
      `/api/v1/search`,
      {
        method: "POST",
        body: JSON.stringify({
          input: input,
          model: model,
          provider: provider,
          space_ids: space_ids,
          file_ids: file_ids,
          thread_id: thread_id,
        }),
      },
      "json",
      {
        "Content-Type": "application/json",
      },
    ),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
}
