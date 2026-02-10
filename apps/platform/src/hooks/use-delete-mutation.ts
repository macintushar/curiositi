import { authClient } from "@platform/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteMutationOptions<T> = {
	mutationFn: () => Promise<T>;
	resourceType: "file" | "space";
	resourceName: string;
	onSuccess?: () => void;
	additionalInvalidateKeys?: string[][];
};

export function useDeleteMutation<T>({
	mutationFn,
	resourceType,
	resourceName,
	onSuccess,
	additionalInvalidateKeys,
}: DeleteMutationOptions<T>) {
	const queryClient = useQueryClient();
	const { data: sessionData } = authClient.useSession();

	const mutation = useMutation({
		mutationFn,
		onSuccess: () => {
			if (resourceType === "file") {
				queryClient.invalidateQueries({
					queryKey: [
						"files",
						"orphan",
						sessionData?.session.activeOrganizationId,
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["files"],
				});
			} else {
				queryClient.invalidateQueries({
					queryKey: [
						"spaces",
						"root",
						sessionData?.session.activeOrganizationId,
					],
				});
				queryClient.invalidateQueries({
					queryKey: ["spaces"],
				});
			}

			if (additionalInvalidateKeys) {
				for (const key of additionalInvalidateKeys) {
					queryClient.invalidateQueries({ queryKey: key });
				}
			}

			toast.success(`${resourceName} deleted successfully`);
			onSuccess?.();
		},
		onError: () => {
			toast.error(`Failed to delete ${resourceType}`);
		},
	});

	return mutation;
}
