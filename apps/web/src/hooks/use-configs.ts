import { useQuery } from "@tanstack/react-query";
import { getConfigs } from "@/services/configs";

// Query keys
export const configKeys = {
  all: ["configs"] as const,
  lists: () => [...configKeys.all, "list"] as const,
};

// Get configs
export function useConfigs() {
  return useQuery({
    queryKey: configKeys.lists(),
    queryFn: async () => {
      const result = await getConfigs();
      if (result.error) {
        throw new Error(result.error?.message ?? "Failed to fetch configs");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - configs don't change often
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
