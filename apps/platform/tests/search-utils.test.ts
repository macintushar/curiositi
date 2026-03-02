import { describe, expect, it } from "vitest";
import {
	formatFileSize,
	formatDate,
	highlightMatches,
	getFileTypeLabel,
	getFileTypeColor,
} from "@platform/lib/search-utils";

describe("Search Utils", () => {
	describe("formatFileSize", () => {
		it("should format bytes", () => {
			expect(formatFileSize(500)).toBe("500 B");
		});

		it("should format kilobytes", () => {
			expect(formatFileSize(1024)).toBe("1 KB");
			expect(formatFileSize(1536)).toBe("1.5 KB");
		});

		it("should format megabytes", () => {
			expect(formatFileSize(1048576)).toBe("1 MB");
			expect(formatFileSize(2621440)).toBe("2.5 MB");
		});

		it("should format gigabytes", () => {
			expect(formatFileSize(1073741824)).toBe("1 GB");
		});

		it("should handle zero bytes", () => {
			expect(formatFileSize(0)).toBe("0 B");
		});

		it("should handle large numbers", () => {
			expect(formatFileSize(5368709120)).toBe("5 GB");
		});
	});

	describe("formatDate", () => {
		it("should return 'Just now' for dates within 60 seconds", () => {
			const now = new Date();
			const recentDate = new Date(now.getTime() - 30000);
			const result = formatDate(recentDate);

			expect(result).toBe("Just now");
		});

		it("should return minutes ago for dates within an hour", () => {
			const now = new Date();
			const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
			const result = formatDate(fiveMinutesAgo);

			expect(result).toBe("5m ago");
		});

		it("should return hours ago for dates within a day", () => {
			const now = new Date();
			const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
			const result = formatDate(threeHoursAgo);

			expect(result).toBe("3h ago");
		});

		it("should handle string dates", () => {
			const now = new Date();
			const result = formatDate(now.toISOString());

			expect(result).toBe("Just now");
		});
	});

	describe("highlightMatches", () => {
		it("should wrap matches in bold markdown", () => {
			expect(highlightMatches("hello world", "world")).toBe("hello **world**");
		});

		it("should be case insensitive", () => {
			expect(highlightMatches("Hello World", "world")).toBe("Hello **World**");
		});

		it("should return original text if no query", () => {
			expect(highlightMatches("hello world", "")).toBe("hello world");
		});

		it("should handle multiple matches", () => {
			expect(highlightMatches("hello world hello", "hello")).toBe(
				"**hello** world **hello**"
			);
		});

		it("should escape special regex characters", () => {
			expect(highlightMatches("test.file.txt", ".")).toBe(
				"test**.**file**.**txt"
			);
		});
	});

	describe("getFileTypeLabel", () => {
		it("should return 'Image' for image types", () => {
			expect(getFileTypeLabel("image/jpeg")).toBe("Image");
			expect(getFileTypeLabel("image/png")).toBe("Image");
			expect(getFileTypeLabel("image/gif")).toBe("Image");
		});

		it("should return 'PDF' for PDF", () => {
			expect(getFileTypeLabel("application/pdf")).toBe("PDF");
		});

		it("should return 'Text' for text types", () => {
			expect(getFileTypeLabel("text/plain")).toBe("Text");
			expect(getFileTypeLabel("text/html")).toBe("Text");
		});

		it("should return 'JSON' for JSON", () => {
			expect(getFileTypeLabel("application/json")).toBe("JSON");
		});

		it("should return 'XML' for XML", () => {
			expect(getFileTypeLabel("application/xml")).toBe("XML");
		});

		it("should return 'File' for unknown types", () => {
			expect(getFileTypeLabel("application/octet-stream")).toBe("File");
		});
	});

	describe("getFileTypeColor", () => {
		it("should return blue for images", () => {
			expect(getFileTypeColor("image/jpeg")).toBe("text-blue-500");
		});

		it("should return red for PDFs", () => {
			expect(getFileTypeColor("application/pdf")).toBe("text-red-500");
		});

		it("should return gray for text", () => {
			expect(getFileTypeColor("text/plain")).toBe("text-gray-500");
		});

		it("should return green for JSON/XML", () => {
			expect(getFileTypeColor("application/json")).toBe("text-green-500");
			expect(getFileTypeColor("application/xml")).toBe("text-green-500");
		});

		it("should return muted gray for unknown", () => {
			expect(getFileTypeColor("application/octet-stream")).toBe(
				"text-gray-400"
			);
		});
	});
});
