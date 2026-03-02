import { describe, expect, test, beforeEach } from "bun:test";
import { createSpace, deleteSpace, getSpaceWithAncestry } from "../src/space";
import { mockDb, resetDbMocks } from "./setup";

describe("Space Handler", () => {
	const mockSpace = {
		id: "space-123",
		name: "Test Space",
		description: null,
		icon: null,
		organizationId: "org-123",
		parentSpaceId: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		resetDbMocks();
	});

	test("createSpace should insert and return space", async () => {
		mockDb.returning.mockReturnValue([mockSpace]);

		const result = await createSpace({
			name: "Test Space",
			organizationId: "org-123",
		});

		expect(mockDb.insert).toHaveBeenCalled();
		// The handler unwraps the array and returns the object
		expect(result.data).toEqual(mockSpace);
		expect(result.error).toBeNull();
	});

	test("getSpaceWithAncestry should process recursive results", async () => {
		const recursiveResult = [
			{ ...mockSpace, id: "root", depth: 0 },
			{ ...mockSpace, id: "parent", parentSpaceId: "root", depth: 1 },
			{ ...mockSpace, id: "child", parentSpaceId: "parent", depth: 2 },
		];

		mockDb.execute.mockResolvedValue(recursiveResult);

		const result = await getSpaceWithAncestry("child");

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result.data).not.toBeNull();
		expect(result.data?.id).toBe("child");
		expect(result.data?.ancestors).toHaveLength(2);
		expect(result.data?.ancestors[0].id).toBe("root");
		expect(result.data?.ancestors[1].id).toBe("parent");
	});

	test("getSpaceWithAncestry should handle not found", async () => {
		mockDb.execute.mockResolvedValue([]);

		const result = await getSpaceWithAncestry("missing");

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
		expect((result.error as Error).message).toBe("Space not found");
	});

	test("deleteSpace should execute transaction", async () => {
		mockDb.transaction.mockImplementation(async (cb: (tx: any) => any) => {
			const hybridResult = {
				then: (resolve: any) => resolve([]),
				returning: () => [mockSpace],
			};

			mockDb.where.mockReturnValue(hybridResult);

			return await cb(mockDb);
		});

		const result = await deleteSpace("space-123");

		expect(mockDb.transaction).toHaveBeenCalled();
		expect(result.data).toEqual([mockSpace]);
		expect(result.error).toBeNull();
	});

	test("createSpace should handle DB error", async () => {
		mockDb.returning.mockRejectedValue(new Error("Insert failed"));

		const result = await createSpace({
			name: "Test Space",
			organizationId: "org-123",
		});

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
	});

	test("getSpaceWithAncestry should handle single space (no ancestors)", async () => {
		const singleResult = [{ ...mockSpace, id: "root", depth: 0 }];

		mockDb.execute.mockResolvedValue(singleResult);

		const result = await getSpaceWithAncestry("root");

		expect(result.data).not.toBeNull();
		expect(result.data?.id).toBe("root");
		expect(result.data?.ancestors).toHaveLength(0);
	});

	test("deleteSpace should handle transaction error", async () => {
		mockDb.transaction.mockRejectedValue(new Error("Transaction failed"));

		const result = await deleteSpace("space-123");

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
	});

	test("getSpaceWithAncestry should handle DB error", async () => {
		mockDb.execute.mockRejectedValue(new Error("Query failed"));

		const result = await getSpaceWithAncestry("space-123");

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
	});
});
