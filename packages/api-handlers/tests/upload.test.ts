import { describe, expect, test, beforeEach } from "bun:test";
import handleUpload, { type UploadHandlerInput } from "../src/upload";
import { mockDb, mockWrite, resetDbMocks } from "./setup";
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
		resetDbMocks();
		mockWrite.mockClear();
		mockWrite.mockResolvedValue(undefined);
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
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test.txt",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		const result = await handleUpload(defaultInput);

		expect(mockWrite).toHaveBeenCalled();
		expect(mockWrite).toHaveBeenCalledWith(
			expect.stringContaining("test.txt"),
			expect.any(File),
			expect.any(Object)
		);

		expect(mockDb.insert).toHaveBeenCalled();
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result.data).toEqual(mockUpdatedFile);
		expect(result.error).toBeNull();
	});

	test("should link to space if spaceId is provided", async () => {
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain",
			size: 12,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test.txt",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		await handleUpload({ ...defaultInput, spaceId: "space-123" });

		// insert is called 2 times: files insert and filesInSpace insert
		expect(mockDb.insert).toHaveBeenCalledTimes(2);
	});

	test("should handle S3 upload failure", async () => {
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain",
			size: 12,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		mockDb.returning.mockReturnValue([mockInsertedFile]);
		mockWrite.mockRejectedValue(new Error("S3 Error"));

		const result = await handleUpload(defaultInput);

		expect(result.data).toBeNull();
		expect(result.error?.db.error).not.toBeNull();
	});

	test("should handle DB insertion failure", async () => {
		mockDb.returning.mockRejectedValue(new Error("DB Error"));

		const result = await handleUpload(defaultInput);

		expect(result.data).toBeNull();
		expect(result.error?.db.error).not.toBeNull();
	});

	test("should reject empty file", async () => {
		const emptyFile = new File([""], "empty.txt", { type: "text/plain" });
		Object.defineProperty(emptyFile, "size", { value: 0 });

		const result = await handleUpload({ ...defaultInput, file: emptyFile });

		expect(result.data).toBeNull();
		expect(mockWrite).not.toHaveBeenCalled();
	});

	test("should handle file with special characters in name", async () => {
		const specialFile = new File(["content"], "test@file#name.txt", {
			type: "text/plain",
		});
		const mockInsertedFile = {
			id: "file-123",
			name: "test@file#name.txt",
			type: "text/plain",
			size: 7,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test_file_name.txt",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		const result = await handleUpload({ ...defaultInput, file: specialFile });

		expect(result.data).toEqual(mockUpdatedFile);
		expect(mockWrite).toHaveBeenCalledWith(
			expect.stringContaining("test_file_name.txt"),
			expect.any(File),
			expect.any(Object)
		);
	});

	test("should handle file with tags", async () => {
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain",
			size: 12,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: ["tag1", "tag2"] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test.txt",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		const result = await handleUpload({
			...defaultInput,
			tags: ["tag1", "tag2"],
		});

		expect(result.data).toEqual(mockUpdatedFile);
		expect(mockDb.insert).toHaveBeenCalled();
	});

	test("should handle mime type with charset", async () => {
		const fileWithCharset = new File(["content"], "test.txt", {
			type: "text/plain; charset=utf-8",
		});
		const mockInsertedFile = {
			id: "file-123",
			name: "test.txt",
			type: "text/plain; charset=utf-8",
			size: 7,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test.txt",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		const result = await handleUpload({
			...defaultInput,
			file: fileWithCharset,
		});

		expect(result.data).not.toBeNull();
		expect(result.error).toBeNull();
	});

	test("should accept supported image types", async () => {
		const imageFile = new File(["fake image"], "test.png", {
			type: "image/png",
		});
		const mockInsertedFile = {
			id: "file-123",
			name: "test.png",
			type: "image/png",
			size: 10,
			path: "",
			createdAt: new Date(),
			organizationId: "org-123",
			updatedAt: null,
			uploadedById: "user-123",
			status: "pending" as const,
			tags: { tags: [] },
			processedAt: null,
		};
		const mockUpdatedFile = {
			...mockInsertedFile,
			path: "/curiositi/storage/org-123/file-123-test.png",
		};
		let returningCallCount = 0;
		mockDb.returning.mockImplementation(() => {
			returningCallCount++;
			if (returningCallCount === 1) return [mockInsertedFile];
			return [mockUpdatedFile];
		});

		const result = await handleUpload({ ...defaultInput, file: imageFile });

		expect(result.data).not.toBeNull();
		expect(result.error).toBeNull();
	});
});
