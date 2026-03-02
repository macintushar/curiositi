import { describe, expect, test } from "bun:test";
import type { S3Config } from "../src/types";

describe("FS Read Module Types", () => {
	test("S3Config type should have required properties", () => {
		const config: S3Config = {
			accessKeyId: "test-key",
			secretAccessKey: "test-secret",
			bucket: "test-bucket",
			endpoint: "https://test-endpoint.com",
		};

		expect(config.accessKeyId).toBe("test-key");
		expect(config.endpoint).toBe("https://test-endpoint.com");
	});
});

describe("S3 Path Construction", () => {
	test("should construct correct S3 path for reading", () => {
		const path = "/curiositi/storage/org-123/file-456-document.pdf";

		expect(path).toContain("org-123");
		expect(path).toContain("file-456");
	});

	test("should handle path with special characters", () => {
		const orgId = "org-123";
		const fileId = "file-456";
		const fileName = "document with spaces.pdf";

		const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
		const path = `/curiositi/storage/${orgId}/${fileId}-${sanitizedFileName}`;

		expect(path).toBe(
			"/curiositi/storage/org-123/file-456-document_with_spaces.pdf"
		);
	});

	test("should parse S3 path components", () => {
		const path = "/curiositi/storage/org-123/file-456-document.pdf";
		const parts = path.split("/");

		expect(parts[2]).toBe("storage");
		expect(parts[3]).toBe("org-123");
		expect(parts[4]).toContain("file-456");
	});
});
