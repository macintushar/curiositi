import { describe, expect, test } from "bun:test";
import type { PageContent, PdfMetadata, PdfParseResult } from "../src/lib/md";

describe("PDF Parser Types", () => {
	test("PageContent type should have required properties", () => {
		const page: PageContent = {
			pageNumber: 1,
			content: "Test content",
		};

		expect(page.pageNumber).toBe(1);
		expect(page.content).toBe("Test content");
	});

	test("PdfMetadata type should allow optional fields", () => {
		const minimalMeta: PdfMetadata = {};
		const fullMeta: PdfMetadata = {
			title: "Test",
			author: "Author",
			subject: "Subject",
			keywords: "test, pdf",
			creator: "Creator",
			producer: "Producer",
			creationDate: "2024-01-01",
			modDate: "2024-01-02",
		};

		expect(minimalMeta).toBeDefined();
		expect(fullMeta.title).toBe("Test");
		expect(fullMeta.author).toBe("Author");
	});

	test("PdfMetadata should allow additional properties", () => {
		const meta: PdfMetadata = {
			title: "Test",
			customField: "custom value",
		};

		expect(meta.customField).toBe("custom value");
	});

	test("PdfParseResult type should have correct shape", () => {
		const result: PdfParseResult = {
			metadata: { title: "Test" },
			pages: [{ pageNumber: 1, content: "Content" }],
		};

		expect(result.metadata).toEqual({ title: "Test" });
		expect(result.pages).toHaveLength(1);
		expect(result.pages[0]?.pageNumber).toBe(1);
	});
});
