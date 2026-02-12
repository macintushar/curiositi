import { describe, expect, test, beforeEach } from "bun:test";
import {
	deleteFile,
	getAllFiles,
	getFileById,
	getFilesNotInSpace,
} from "../src/file";
import { mockDb, resetDbMocks } from "./setup";

describe("File Handler", () => {
	const mockFileData = {
		id: "file-123",
		name: "test.txt",
		path: "path/to/test.txt",
		size: 1024,
		type: "text/plain",
		organizationId: "org-123",
		uploadedById: "user-123",
		status: "pending" as const,
		tags: [],
		processedAt: null,
		createdAt: new Date(),
		updatedAt: null,
	};

	beforeEach(() => {
		resetDbMocks();
	});

	test("getAllFiles should return files for org", async () => {
		mockDb.orderBy.mockReturnValue([mockFileData]);

		const result = await getAllFiles("org-123");

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalled();
		expect(result.data?.data).toEqual([mockFileData]);
		expect(result.error).toBeNull();
	});

	test("getFileById should return file when found", async () => {
		mockDb.where.mockReturnValue([mockFileData]);

		const result = await getFileById("file-123");

		expect(result.data).toEqual(mockFileData);
		expect(result.error).toBeNull();
	});

	test("getFileById should return error when not found", async () => {
		mockDb.where.mockReturnValue([]);

		const result = await getFileById("file-123");

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
		expect((result.error as Error).message).toBe("File not found");
	});

	test("getFilesNotInSpace should query with notExists", async () => {
		mockDb.where.mockReturnValue([mockFileData]);

		const result = await getFilesNotInSpace("org-123");

		expect(mockDb.select).toHaveBeenCalledTimes(2); // One for main query, one for subquery
		expect(result.data).toEqual([mockFileData]);
	});

	test("deleteFile should delete from both tables", async () => {
		// Mock transaction callback execution
		mockDb.transaction.mockImplementation(async (cb: (tx: any) => any) => {
			const hybridResult = {
				returning: () => [mockFileData],
				then: (resolve: any) => resolve([]),
			};
			mockDb.where.mockReturnValue(hybridResult);
			return await cb(mockDb);
		});

		const result = await deleteFile("file-123");

		expect(mockDb.transaction).toHaveBeenCalled();
		// Should delete from filesInSpace first, then files
		expect(mockDb.delete).toHaveBeenCalledTimes(2);
		expect(result.data).toEqual(mockFileData);
	});

	test("deleteFile should handle not found", async () => {
		mockDb.transaction.mockImplementation(async (cb: (tx: any) => any) => {
			const hybridResult = {
				returning: () => [], // No file deleted
				then: (resolve: any) => resolve([]),
			};
			mockDb.where.mockReturnValue(hybridResult);
			return await cb(mockDb);
		});

		const result = await deleteFile("file-123");

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
		expect((result.error as Error).message).toBe("File not found");
	});
});
