import { tryCatch } from "@/lib/utils";
import { apiFetch } from "./api";
import type { ApiResponse, ProviderResponse } from "@/types";

export const getConfigs = async () => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<ProviderResponse>>("/api/v1/configs", {
      method: "POST",
      body: JSON.stringify({ invalidate_cache: false }),
    }),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};
