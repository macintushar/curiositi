import { useQuery } from "@tanstack/react-query";
import { getUsersFiles } from "@/services/files";

// Query keys
export const fileKeys = {
  all: ["files"] as const,
  lists: () => [...fileKeys.all, "list"] as const,
  userFiles: () => [...fileKeys.lists(), "user"] as const,
};

// Get all user files
export function useUserFiles() {
  return useQuery({
    queryKey: fileKeys.userFiles(),
    queryFn: async () => {
      const result = await getUsersFiles();
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch user files");
      }
      return result.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}
