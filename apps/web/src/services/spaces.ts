import type {
  ApiResponse,
  File as CuriositiFile,
  MessageResponse,
  Space,
  SpaceResponse,
} from "@/types";
import { apiFetch } from "./api";
import { tryCatch } from "@/lib/utils";
import { clientApiFetch } from "./client-fetch";

export const getSpaces = async () => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<SpaceResponse<number>[]>>("/api/v1/spaces"),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};

export const getSpace = async (id: string) => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<SpaceResponse<number>>>(`/api/v1/spaces/${id}`),
  );

  return {
    data: data ?? null,
    error: error ?? null,
  };
};

export const createSpace = async (
  name: string,
  icon: string,
  description: string,
) => {
  const data = await apiFetch<ApiResponse<Space[]>>(
    `/api/v1/spaces`,
    {
      method: "POST",
      body: JSON.stringify({
        name: name,
        icon: icon,
        description: description,
      }),
    },
    "json",
    {
      "Content-Type": "application/json",
    },
  );
  return {
    data,
    error: null,
  };
};

export const deleteSpace = async (id: string) => {
  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<MessageResponse>>(`/api/v1/spaces/${id}`, {
      method: "DELETE",
    }),
  );

  return {
    data,
    error,
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
    clientApiFetch<File>(
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

export const uploadFile = async (spaceId: string, file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("space_id", spaceId);

  const { data, error } = await tryCatch(
    apiFetch<ApiResponse<MessageResponse & { file: CuriositiFile }>>(
      `/api/v1/files/upload`,
      {
        method: "POST",
        body: formData,
      },
      "json",
    ),
  );

  return { data, error };
};
