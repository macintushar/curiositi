import { describe, expect, test, beforeEach } from "bun:test";
import handleUpload, { type UploadHandlerInput } from "../src/upload";
import { mockDb, mockWrite } from "./setup";
import { MAX_FILE_SIZE } from "@curiositi/share/constants";

describe("Upload Handler", () => {
	const mockFile = new File(["test content"], "test.txt", {
		type: "text/plain",
	});

	const defaultInput: UploadHandlerInput = {
		file: mockFile,
		orgId: "org-123",
		userId: "user-123",
		s3: {
			accessKeyId: "test-key",
			secretAccessKey: "test-secret",
			bucket: "test-bucket",
			endpoint: "test-endpoint",
		},
	};

	beforeEach(() => {
		mockDb.insert.mockClear();
		mockDb.returning.mockClear();
		mockWrite.mockClear();
	});

	test("should reject file larger than limit", async () => {
		const largeFile = new File([""], "large.txt", { type: "text/plain" });
		Object.defineProperty(largeFile, "size", { value: MAX_FILE_SIZE + 1 });

		const result = await handleUpload({ ...defaultInput, file: largeFile });

		expect(result.error).not.toBeNull();
		expect(result.error?.validation.error).toContain("File size exceeds");
		expect(mockWrite).not.toHaveBeenCalled();
	});

	test("should reject unsupported mime type", async () => {
		const invalidFile = new File([""], "test.exe", {
			type: "application/x-msdownload",
		});

		const result = await handleUpload({ ...defaultInput, file: invalidFile });

		expect(result.error).not.toBeNull();
		expect(result.error?.validation.error).toContain("File type");
		expect(mockWrite).not.toHaveBeenCalled();
	});

	test("should successfully upload file", async () => {
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain",
			size: 12,
			path: "/curiositi/storage/org-123/hash-test.txt",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		mockDb.returning.mockReturnValue([mockInsertedFile]);

		const result = await handleUpload(defaultInput);

		// Verify S3 upload
		expect(mockWrite).toHaveBeenCalled();
		expect(mockWrite).toHaveBeenCalledWith(
			expect.stringContaining("test.txt"),
			expect.any(File),
			expect.any(Object)
		);

		// Verify DB insertion
		expect(mockDb.insert).toHaveBeenCalled();
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result.data).toEqual(mockInsertedFile);
		expect(result.error).toBeNull();
	});

	test("should link to space if spaceId is provided", async () => {
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain",
			size: 12,
			path: "/curiositi/storage/org-123/hash-test.txt",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		mockDb.returning.mockReturnValue([mockInsertedFile]);

		await handleUpload({ ...defaultInput, spaceId: "space-123" });

		// Verify second insert for filesInSpace
		// First call is for 'files', second for 'filesInSpace'
		expect(mockDb.insert).toHaveBeenCalledTimes(2);
	});

	test("should handle S3 upload failure", async () => {
		mockWrite.mockRejectedValue(new Error("S3 Error"));

		const result = await handleUpload(defaultInput);

		expect(result.data).toBeNull();
		expect(result.error?.s3.error).not.toBeNull();
		expect(mockDb.insert).not.toHaveBeenCalled();
	});

	test("should handle DB insertion failure", async () => {
		mockWrite.mockResolvedValue(undefined);
		mockDb.returning.mockRejectedValue(new Error("DB Error"));

		const result = await handleUpload(defaultInput);

		expect(result.data).toBeNull();
		expect(result.error?.db.error).not.toBeNull();
	});
});
