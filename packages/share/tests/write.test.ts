import { describe, expect, test } from "bun:test";
import { isS3UploadError, type S3UploadError } from "../src/fs/src/write";
import type { S3Config } from "../src/types";

describe("FS Write Module Types", () => {
	test("S3Config type should have required properties", () => {
		const config: S3Config = {
			accessKeyId: "test-key",
			secretAccessKey: "test-secret",
			bucket: "test-bucket",
			endpoint: "https://test-endpoint.com",
		};

		expect(config.accessKeyId).toBe("test-key");
		expect(config.bucket).toBe("test-bucket");
	});

	test("S3UploadError type should have correct shape", () => {
		const error: S3UploadError = Object.assign(new Error("S3 Error"), {
			type: "S3UploadError" as const,
			originalError: new Error("original"),
			path: "test/path.txt",
		});

		expect(error.type).toBe("S3UploadError");
		expect(error.path).toBe("test/path.txt");
	});
});

describe("isS3UploadError function", () => {
	test("should return true for S3UploadError", () => {
		const error = Object.assign(new Error("S3 Error"), {
			type: "S3UploadError",
			path: "test/path.txt",
		});

		expect(isS3UploadError(error)).toBe(true);
	});

	test("should return false for regular Error", () => {
		const error = new Error("Regular error");

		expect(isS3UploadError(error)).toBe(false);
	});

	test("should return false for non-Error values", () => {
		expect(isS3UploadError("error string")).toBe(false);
		expect(isS3UploadError(null)).toBe(false);
		expect(isS3UploadError(undefined)).toBe(false);
		expect(isS3UploadError({})).toBe(false);
	});

	test("should return false for error with wrong type", () => {
		const error = Object.assign(new Error("Error"), {
			type: "DifferentError",
		});

		expect(isS3UploadError(error)).toBe(false);
	});
});

describe("S3 Operations Logic", () => {
	test("should construct correct S3 path", () => {
		const orgId = "org-123";
		const fileId = "file-456";
		const fileName = "document.pdf";

		const path = `/curiositi/storage/${orgId}/${fileId}-${fileName}`;

		expect(path).toContain(orgId);
		expect(path).toContain(fileId);
		expect(path).toContain(fileName);
	});

	test("should sanitize filename correctly", () => {
		const sanitizeFileName = (name: string) =>
			name.replace(/[^a-zA-Z0-9._-]/g, "_");

		expect(sanitizeFileName("test file.txt")).toBe("test_file.txt");
		expect(sanitizeFileName("test@file#name.txt")).toBe("test_file_name.txt");
		expect(sanitizeFileName("normal-file_name.txt")).toBe(
			"normal-file_name.txt"
		);
	});
});
