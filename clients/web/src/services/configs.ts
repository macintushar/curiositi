import { tryCatch } from "@/lib/utils";
import { apiFetch } from "./api";
import type { ApiResponse, Configs } from "@/types";

export const getConfigs = async () => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<Configs>>("/api/v1/configs", {
      method: "POST",
      body: JSON.stringify({ invalidate_cache: false }),
    }),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};
