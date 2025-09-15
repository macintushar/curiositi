import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getThreads, getThreadMessages, sendMessage } from "@/services/chats";
import { deleteThread } from "@/services/thread";
import { createThread } from "@/actions/thread";
import type { ApiResponse, Thread } from "@/types";

// Query keys
export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  list: (filters: string) => [...threadKeys.lists(), { filters }] as const,
  details: () => [...threadKeys.all, "detail"] as const,
  detail: (id: string) => [...threadKeys.details(), id] as const,
  messages: (id: string) => [...threadKeys.detail(id), "messages"] as const,
};

// Get all threads
export function useThreads() {
  return useQuery({
    queryKey: threadKeys.lists(),
    queryFn: async () => {
      const result = await getThreads();
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch threads");
      }
      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
  });
}

// Get thread messages
export function useThreadMessages(threadId: string) {
  return useQuery({
    queryKey: threadKeys.messages(threadId),
    queryFn: async () => {
      const result = await getThreadMessages(threadId);
      if (result.error) {
        throw new Error(
          result.error?.message ?? "Failed to fetch thread messages",
        );
      }
      return result.data;
    },
    enabled: !!threadId,
    staleTime: 10 * 1000, // 10 seconds for messages
  });
}

// Create thread mutation
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createThread,
    onSuccess: (newThread) => {
      // Invalidate and refetch threads
      void queryClient.invalidateQueries({ queryKey: threadKeys.lists() });

      // Add the new thread to the cache optimistically
      queryClient.setQueryData(
        threadKeys.lists(),
        (old: ApiResponse<Thread[]> | undefined) => {
          if (!old?.data || !newThread?.data) return old;
          return {
            ...old,
            data: [newThread.data, ...old.data],
          };
        },
      );
    },
    onError: (error) => {
      console.error("Failed to create thread:", error);
    },
  });
}

// Delete thread mutation with optimistic updates
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteThread,
    onMutate: async (threadId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: threadKeys.lists() });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData(threadKeys.lists());

      // Optimistically update to remove the thread
      queryClient.setQueryData(
        threadKeys.lists(),
        (old: ApiResponse<Thread[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((thread) => thread.id !== threadId),
          };
        },
      );

      return { previousThreads };
    },
    onError: (err, threadId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousThreads) {
        queryClient.setQueryData(threadKeys.lists(), context.previousThreads);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      input: string;
      model: string;
      provider: string;
      thread_id: string;
      space_ids: string[];
      file_ids: string[];
    }) => {
      const result = await sendMessage(
        params.input,
        params.model,
        params.provider,
        params.thread_id,
        params.space_ids,
        params.file_ids,
      );
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to send message");
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate thread messages to refetch with new message
      void queryClient.invalidateQueries({
        queryKey: threadKeys.messages(variables.thread_id),
      });

      // Update threads list to reflect the updated timestamp
      void queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });
}
