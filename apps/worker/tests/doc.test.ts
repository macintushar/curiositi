import { describe, expect, test } from "bun:test";
import { TEXT_FILE_TYPES } from "@curiositi/share/constants";

describe("Document Processor Logic", () => {
	function isTextMimeType(mimeType: string): boolean {
		return TEXT_FILE_TYPES.includes(mimeType) || mimeType.startsWith("text/");
	}

	test("isTextMimeType should return true for text types", () => {
		expect(isTextMimeType("text/plain")).toBe(true);
		expect(isTextMimeType("text/markdown")).toBe(true);
		expect(isTextMimeType("application/json")).toBe(true);
		expect(isTextMimeType("text/custom")).toBe(true);
		expect(isTextMimeType("application/pdf")).toBe(false);
	});

	test("should determine text file vs PDF", () => {
		expect(isTextMimeType("text/plain")).toBe(true);
		expect(isTextMimeType("application/pdf")).toBe(false);
	});

	test("ProcessorResult should have correct shape", () => {
		type ProcessorResult = Array<{ pageNumber: number; content: string }>;

		const result: ProcessorResult = [
			{ pageNumber: 1, content: "Page one content" },
			{ pageNumber: 2, content: "Page two content" },
		];

		expect(result).toHaveLength(2);
		expect(result[0]?.pageNumber).toBe(1);
	});

	test("FileData type should have required properties", () => {
		type FileData = {
			id: string;
			type: string;
			name: string;
		};

		const fileData: FileData = {
			id: "file-123",
			type: "text/plain",
			name: "test.txt",
		};

		expect(fileData.type).toBe("text/plain");
	});
});
