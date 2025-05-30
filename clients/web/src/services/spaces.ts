import type {
  ApiResponse,
  File as CuriositiFile,
  MessageResponse,
  SpaceResponse,
} from "@/types";
import { apiFetch } from "./api";
import { tryCatch } from "@/lib/utils";

export const getSpaces = async () => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<SpaceResponse[]>>("/api/v1/spaces"),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};

export const createSpace = async (name: string, icon: string) => {
  const data = await apiFetch<ApiResponse<SpaceResponse>>(`/api/v1/spaces`, {
    method: "POST",
    body: JSON.stringify({ name, icon }),
  });
  return {
    data,
    error: null,
  };
};

export const getFilesInSpace = async (id: string) => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<CuriositiFile[]>>(`/api/v1/files/${id}`),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};

export const getFile = async (spaceId: string, fileId: string) => {
  const { data, error } = await tryCatch(
    apiFetch<File>(
      `/api/v1/files/${spaceId}/${fileId}`,
      {
        method: "POST",
      },
      "direct",
    ),
  );

  return { data, error };
};

export const deleteFile = async (spaceId: string, fileId: string) => {
  const { data, error } = await tryCatch(
    apiFetch<MessageResponse>(`/api/v1/files/${spaceId}/${fileId}`, {
      method: "DELETE",
    }),
  );

  return { data, error };
};
