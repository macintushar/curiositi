import { tryCatch } from "@/lib/utils";

import type { ApiResponse, Thread, ThreadMessage } from "@/types";

import { apiFetch } from "./api";
import { clientApiFetch } from "./client-fetch";
import dayjs from "dayjs";

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

// Client-side streaming support for assistant responses
export async function sendMessageStream(
  input: string,
  model: string,
  provider: string,
  thread_id: string,
  space_ids: string[],
  file_ids: string[],
  signal?: AbortSignal,
): Promise<AsyncIterable<string>> {
  const response = await clientApiFetch<Response>(
    `/api/v1/search/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Timezone": `${dayjs().format("YYYY-MM-DD HH:mm:ss Z")} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      },
      body: JSON.stringify({
        input,
        model,
        provider,
        space_ids,
        file_ids,
        thread_id,
      }),
      signal,
    },
    "direct",
  );

  if (!response.ok || !response.body) {
    const msg = !response.ok
      ? `Streaming request failed: ${response.status} ${response.statusText}`
      : "No response body returned for stream";
    throw new Error(msg);
  }

  const reader = response.body.getReader();
  const textDecoder = new TextDecoder();

  async function* iterator(): AsyncGenerator<string> {
    try {
      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            yield textDecoder.decode(value, { stream: true });
          }
        } catch (err: unknown) {
          if (signal && (err as any)?.name === "AbortError") {
            break;
          }
          throw err;
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  }

  return iterator();
}
