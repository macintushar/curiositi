import { tryCatch } from "@/lib/utils";

import type { ApiResponse, Thread } from "@/types";

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
