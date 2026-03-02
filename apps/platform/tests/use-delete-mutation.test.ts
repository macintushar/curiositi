import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDeleteMutation } from "@platform/hooks/use-delete-mutation";

const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
	invalidateQueries: mockInvalidateQueries,
};

vi.mock("@platform/lib/auth-client", () => ({
	authClient: {
		useSession: vi.fn(() => ({
			data: {
				session: {
					activeOrganizationId: "org-123",
				},
			},
		})),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@tanstack/react-query", () => ({
	useMutation: vi.fn((options) => {
		return {
			mutate: vi.fn(),
			mutateAsync: vi.fn(async () => {
				await options.mutationFn();
				if (options.onSuccess) {
					options.onSuccess();
				}
			}),
			isError: false,
			isPending: false,
			isSuccess: true,
		};
	}),
	useQueryClient: vi.fn(() => mockQueryClient),
}));

describe("useDeleteMutation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return mutation object with correct properties", () => {
		const mutation = useDeleteMutation({
			mutationFn: vi.fn(),
			resourceType: "file",
			resourceName: "test.txt",
		});

		expect(mutation).toHaveProperty("mutate");
		expect(mutation).toHaveProperty("mutateAsync");
		expect(mutation).toHaveProperty("isError");
		expect(mutation).toHaveProperty("isPending");
		expect(mutation).toHaveProperty("isSuccess");
	});

	it("should invalidate file queries on success for file resource", async () => {
		const mutation = useDeleteMutation({
			mutationFn: vi.fn(),
			resourceType: "file",
			resourceName: "test.txt",
		});

		await mutation.mutateAsync();

		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ["files", "orphan", "org-123"],
		});
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ["files"],
		});
	});

	it("should invalidate space queries on success for space resource", async () => {
		const mutation = useDeleteMutation({
			mutationFn: vi.fn(),
			resourceType: "space",
			resourceName: "My Space",
		});

		await mutation.mutateAsync();

		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ["spaces", "root", "org-123"],
		});
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ["spaces"],
		});
	});

	it("should call additional invalidate keys", async () => {
		const mutation = useDeleteMutation({
			mutationFn: vi.fn(),
			resourceType: "file",
			resourceName: "test.txt",
			additionalInvalidateKeys: [["custom", "key"]],
		});

		await mutation.mutateAsync();

		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ["custom", "key"],
		});
	});

	it("should call onSuccess callback", async () => {
		const onSuccess = vi.fn();
		const mutation = useDeleteMutation({
			mutationFn: vi.fn(),
			resourceType: "file",
			resourceName: "test.txt",
			onSuccess,
		});

		await mutation.mutateAsync();

		expect(onSuccess).toHaveBeenCalled();
	});
});
