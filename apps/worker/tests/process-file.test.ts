import { describe, expect, test } from "bun:test";
import { createResponse } from "../src/utils";

describe("createResponse utility", () => {
	test("should create success response", () => {
		const result = createResponse({ id: "123" }, null);
		expect(result.data).toEqual({ id: "123" });
		expect(result.error).toBeNull();
	});

	test("should create error response", () => {
		const result = createResponse(null, "File not found");
		expect(result.data).toBeNull();
		expect(result.error).toBe("File not found");
	});

	test("should handle both null", () => {
		const result = createResponse(null, null);
		expect(result.data).toBeNull();
		expect(result.error).toBeNull();
	});

	test("should handle complex data objects", () => {
		const data = {
			fileId: "file-123",
			orgId: "org-456",
			chunks: [{ content: "chunk 1" }, { content: "chunk 2" }],
		};
		const result = createResponse(data, null);
		expect(result.data).toEqual(data);
	});

	test("should handle Error objects", () => {
		const error = new Error("Processing failed");
		const result = createResponse(null, error);
		expect(result.error).toBe(error);
	});
});
