import { tryCatch } from "@/lib/utils";
import { apiFetch } from "./api";
import type { AllFiles, ApiResponse } from "@/types";

export const getUsersFiles = async () => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<AllFiles[]>>(`/api/v1/files/all`),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};
