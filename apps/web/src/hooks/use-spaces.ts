import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpaces,
  getSpace,
  createSpace,
  deleteSpace,
  getFilesInSpace,
  getFile,
  deleteFile,
  uploadFile,
} from "@/services/spaces";
import type {
  ApiResponse,
  SpaceResponse,
  File as CuriositiFile,
} from "@/types";

// Query keys
export const spaceKeys = {
  all: ["spaces"] as const,
  lists: () => [...spaceKeys.all, "list"] as const,
  list: (filters: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, "detail"] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
  files: (id: string) => [...spaceKeys.detail(id), "files"] as const,
};

// Get all spaces
export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: async () => {
      const result = await getSpaces();
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch spaces");
      }
      return result.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

// Get single space
export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: async () => {
      const result = await getSpace(spaceId);
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch space");
      }
      return result.data;
    },
    enabled: !!spaceId,
    staleTime: 60 * 1000,
  });
}

// Get files in space
export function useFilesInSpace(spaceId: string) {
  return useQuery({
    queryKey: spaceKeys.files(spaceId),
    queryFn: async () => {
      const result = await getFilesInSpace(spaceId);
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch files");
      }
      return result.data;
    },
    enabled: !!spaceId,
    staleTime: 30 * 1000,
  });
}

// Create space mutation
export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      icon: string;
      description: string;
    }) => {
      const result = await createSpace(
        params.name,
        params.icon,
        params.description,
      );
      return result.data;
    },
    onSuccess: (newSpace) => {
      // Invalidate spaces list
      void queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });

      // Add the new space to the cache optimistically
      queryClient.setQueryData(
        spaceKeys.lists(),
        (old: ApiResponse<SpaceResponse<number>[]> | undefined) => {
          if (!old?.data || !newSpace?.data) return old;
          const createdSpaces = newSpace.data;
          const createdAsResponses: SpaceResponse<number>[] = createdSpaces.map(
            (created) => ({
              space: created,
              user: null,
              files: 0,
            }),
          );
          return {
            ...old,
            data: [...old.data, ...createdAsResponses],
          };
        },
      );
    },
    onError: (error) => {
      console.error("Failed to create space:", error);
    },
  });
}

// Delete space mutation with optimistic updates
export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpace,
    onMutate: async (spaceId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: spaceKeys.lists() });

      // Snapshot the previous value
      const previousSpaces = queryClient.getQueryData(spaceKeys.lists());

      // Optimistically update to remove the space
      queryClient.setQueryData(
        spaceKeys.lists(),
        (old: ApiResponse<SpaceResponse<number>[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((space) => space.space.id !== spaceId),
          };
        },
      );

      return { previousSpaces };
    },
    onError: (err, spaceId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSpaces) {
        queryClient.setQueryData(spaceKeys.lists(), context.previousSpaces);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
  });
}

// Upload file mutation
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { spaceId: string; file: File }) => {
      const result = await uploadFile(params.spaceId, params.file);
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to upload file");
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate files in the specific space
      void queryClient.invalidateQueries({
        queryKey: spaceKeys.files(variables.spaceId),
      });

      // Update spaces list to reflect new file count
      void queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to upload file:", error);
    },
  });
}

// Delete file mutation with optimistic updates
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { spaceId: string; fileId: string }) => {
      const result = await deleteFile(params.spaceId, params.fileId);
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to delete file");
      }
      return result.data;
    },
    onMutate: async ({ spaceId, fileId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: spaceKeys.files(spaceId) });

      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData(spaceKeys.files(spaceId));

      // Optimistically update to remove the file
      queryClient.setQueryData(
        spaceKeys.files(spaceId),
        (old: ApiResponse<CuriositiFile[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((file) => file.id !== fileId),
          };
        },
      );

      return { previousFiles };
    },
    onError: (err, { spaceId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFiles) {
        queryClient.setQueryData(
          spaceKeys.files(spaceId),
          context.previousFiles,
        );
      }
    },
    onSuccess: (_data, { spaceId: _spaceId }) => {
      // Update spaces list to reflect new file count
      void queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
    onSettled: (_data, _error, { spaceId }) => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({
        queryKey: spaceKeys.files(spaceId),
      });
    },
  });
}

// Get file (for download)
export function useGetFile(spaceId: string, fileId: string) {
  return useQuery({
    queryKey: [...spaceKeys.files(spaceId), "file", fileId],
    queryFn: async () => {
      const result = await getFile(spaceId, fileId);
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch file");
      }
      return result.data;
    },
    enabled: !!spaceId && !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes for file downloads
  });
}
