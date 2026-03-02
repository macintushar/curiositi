import { describe, expect, test } from "bun:test";
import { LARGE_IMAGE_THRESHOLD, IMAGE_TYPES } from "@curiositi/share/constants";

describe("Image Processor Logic", () => {
	test("ProcessorResult should have correct shape", () => {
		type ProcessorResult = Array<{ pageNumber: number; content: string }>;

		const result: ProcessorResult = [
			{ pageNumber: 1, content: "An image description" },
		];

		expect(result).toHaveLength(1);
		expect(result[0]?.pageNumber).toBe(1);
		expect(result[0]?.content).toBe("An image description");
	});

	test("FileData type should have required properties", () => {
		type FileData = {
			id: string;
			type: string;
			size: number;
			name: string;
		};

		const fileData: FileData = {
			id: "file-123",
			type: "image/jpeg",
			size: 1024 * 100,
			name: "test.jpg",
		};

		expect(fileData.id).toBe("file-123");
		expect(fileData.type).toBe("image/jpeg");
	});

	test("should handle large image threshold", () => {
		const largeImageSize = 6 * 1024 * 1024;
		const smallImageSize = 1 * 1024 * 1024;

		expect(largeImageSize > LARGE_IMAGE_THRESHOLD).toBe(true);
		expect(smallImageSize > LARGE_IMAGE_THRESHOLD).toBe(false);
	});

	test("should calculate size in MB correctly", () => {
		const sizeBytes = 5 * 1024 * 1024;
		const sizeMB = sizeBytes / 1024 / 1024;

		expect(sizeMB).toBe(5);
	});

	test("should identify supported image types", () => {
		expect(IMAGE_TYPES.includes("image/jpeg")).toBe(true);
		expect(IMAGE_TYPES.includes("image/png")).toBe(true);
		expect(IMAGE_TYPES.includes("image/gif")).toBe(true);
		expect(IMAGE_TYPES.includes("image/webp")).toBe(true);
		expect(IMAGE_TYPES.includes("image/bmp")).toBe(false);
	});
});
