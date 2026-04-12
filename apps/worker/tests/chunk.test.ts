import { describe, expect, test, mock } from "bun:test";

mock.module("js-tiktoken", () => {
	const encoder = {
		encode: (text: string) => new Uint32Array(text.length),
		decode: (tokens: Uint32Array) => "overlap",
	};
	return { getEncoding: () => encoder };
});

import chunkText, { chunkPages } from "../src/lib/chunk";
import type { PageContent } from "../src/lib/md";

describe("Chunk Text", () => {
	test("should chunk text into multiple parts when exceeding max size", () => {
		const content = `${"a".repeat(4000)}\n\n${"b".repeat(4000)}`;

		const chunks = chunkText(content, { maxChunkSize: 500 });

		expect(chunks.length).toBeGreaterThan(1);
	});

	test("should return single chunk for small content", () => {
		const content = "Small content here";

		const chunks = chunkText(content);

		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.content).toBe(content);
	});

	test("should handle empty content", () => {
		const chunks = chunkText("");

		expect(chunks).toHaveLength(0);
	});

	test("should handle content with only whitespace", () => {
		const chunks = chunkText("   \n\n   \n   ");

		expect(chunks).toHaveLength(0);
	});

	test("should respect overlap parameter", () => {
		const content = `${"a".repeat(2000)}\n\n${"b".repeat(2000)}`;

		const chunksNoOverlap = chunkText(content, {
			maxChunkSize: 300,
			overlap: 0,
		});
		const chunksWithOverlap = chunkText(content, {
			maxChunkSize: 300,
			overlap: 100,
		});

		expect(chunksWithOverlap.length).toBeGreaterThanOrEqual(
			chunksNoOverlap.length
		);
	});

	test("should split on paragraph boundaries", () => {
		const content = "Paragraph one.\n\nParagraph two.\n\nParagraph three.";

		const chunks = chunkText(content, { maxChunkSize: 50 });

		expect(chunks.length).toBeGreaterThan(0);
		for (const chunk of chunks) {
			expect(chunk.content.length).toBeLessThanOrEqual(50 * 4 + 100);
		}
	});

	test("should handle single paragraph", () => {
		const content = "Single paragraph without any breaks";

		const chunks = chunkText(content);

		expect(chunks).toHaveLength(1);
	});

	test("should filter out empty chunks", () => {
		const content = "Content\n\n\n\n\nMore content";

		const chunks = chunkText(content);

		for (const chunk of chunks) {
			expect(chunk.content.trim().length).toBeGreaterThan(0);
		}
	});

	test("should include embeddedText with context prefix", () => {
		const content = "Test content for embedding";

		const chunks = chunkText(content, {
			fileName: "test.pdf",
			fileType: "application/pdf",
		});

		expect(chunks[0]?.embeddedText).toContain("Document: test.pdf");
		expect(chunks[0]?.content).toBe("Test content for embedding");
	});
});

describe("Chunk Pages", () => {
	test("should chunk pages while preserving page numbers", () => {
		const pages: PageContent[] = [
			{ pageNumber: 1, content: "Page one content" },
			{ pageNumber: 2, content: "Page two content" },
		];

		const chunks = chunkPages(pages);

		expect(chunks.length).toBeGreaterThan(0);
		expect(chunks[0]?.pageNumber).toBe(1);
	});

	test("should handle empty pages array", () => {
		const chunks = chunkPages([]);

		expect(chunks).toHaveLength(0);
	});

	test("should handle page with empty content", () => {
		const pages: PageContent[] = [
			{ pageNumber: 1, content: "" },
			{ pageNumber: 2, content: "Actual content" },
		];

		const chunks = chunkPages(pages);

		expect(chunks.length).toBeGreaterThan(0);
	});

	test("should preserve page number for single page", () => {
		const pages: PageContent[] = [{ pageNumber: 5, content: "Single page" }];

		const chunks = chunkPages(pages);

		expect(chunks[0]?.pageNumber).toBe(5);
		expect(chunks[0]?.pageNumbers).toBeUndefined();
	});

	test("should handle overlap correctly", () => {
		const pages: PageContent[] = [
			{
				pageNumber: 1,
				content: `Start content. ${"x".repeat(3000)} End content.`,
			},
		];

		const chunks = chunkPages(pages, { maxChunkSize: 200, overlap: 50 });

		const secondChunk = chunks[1];
		if (chunks.length > 1 && secondChunk) {
			expect(secondChunk.content).toContain("content");
		}
	});

	test("should filter out empty chunks", () => {
		const pages: PageContent[] = [
			{ pageNumber: 1, content: "Valid content" },
			{ pageNumber: 2, content: "   " },
			{ pageNumber: 3, content: "" },
		];

		const chunks = chunkPages(pages);

		for (const chunk of chunks) {
			expect(chunk.content.trim().length).toBeGreaterThan(0);
		}
	});

	test("should track page numbers when content spans pages", () => {
		const longContent = "a".repeat(3500);
		const pages: PageContent[] = [
			{ pageNumber: 1, content: longContent },
			{ pageNumber: 2, content: "b".repeat(3500) },
			{ pageNumber: 3, content: "c".repeat(3500) },
		];

		const chunks = chunkPages(pages, { maxChunkSize: 300, overlap: 50 });

		expect(chunks.length).toBeGreaterThan(1);
		const allHavePageNumbers = chunks.every((c) => c.pageNumber >= 1);
		expect(allHavePageNumbers).toBe(true);
	});

	test("should include embeddedText with document context", () => {
		const pages: PageContent[] = [
			{ pageNumber: 1, content: "First page content here" },
			{ pageNumber: 2, content: "Second page content here" },
		];

		const chunks = chunkPages(pages, {
			fileName: "report.pdf",
			fileType: "application/pdf",
		});

		for (const chunk of chunks) {
			expect(chunk.embeddedText).toContain("Document: report.pdf");
			expect(chunk.embeddedText).toContain(chunk.content);
		}
	});
});
