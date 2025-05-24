import type { ApiResponse, SpaceResponse } from "@/types";
import { apiFetch } from "./api";

export const getSpaces = async () => {
  const data = await apiFetch<ApiResponse<SpaceResponse[]>>("/api/v1/spaces");
  return {
    data,
    error: null,
  };
};
