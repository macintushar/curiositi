import { describe, expect, test } from "bun:test";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Heading, Content } from "mdast";
import type { PageContent } from "../src/lib/md";

const parser = unified().use(remarkParse);
const serializer = unified().use(remarkStringify);

function extractHeadingText(heading: Heading): string {
	return heading.children
		.map((child) => {
			if (child.type === "text") return child.value;
			if ("children" in child) {
				return (child.children as Array<{ value: string }>)
					.map((c) => c.value)
					.join("");
			}
			return "";
		})
		.join("");
}

function splitMarkdownIntoSections(markdown: string): PageContent[] {
	const tree = parser.parse(markdown) as Root;

	const sections: PageContent[] = [];
	let currentTitle: string | undefined;
	let currentNodes: Content[] = [];

	function flushSection(): void {
		if (currentNodes.length === 0) return;
		const subtree: Root = { type: "root", children: currentNodes };
		const content = String(serializer.stringify(subtree)).trim();
		if (!content) return;
		sections.push({
			pageNumber: sections.length + 1,
			content,
			...(currentTitle && {
				sectionTitle: currentTitle,
				metadata: { sectionTitle: currentTitle },
			}),
		});
	}

	for (const node of tree.children) {
		if (node.type === "heading") {
			flushSection();
			currentTitle = extractHeadingText(node as Heading);
			currentNodes = [];
		} else {
			currentNodes.push(node);
		}
	}

	flushSection();

	if (sections.length === 0 && markdown.trim()) {
		sections.push({ pageNumber: 1, content: markdown.trim() });
	}

	return sections;
}

describe("splitMarkdownIntoSections", () => {
	test("splits on h1 headings and attributes content correctly", () => {
		const md =
			"# Introduction\n\nThis is the intro.\n\n# Methods\n\nThis is the methods.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(2);
		expect(sections[0]?.sectionTitle).toBe("Introduction");
		expect(sections[0]?.content).toBe("This is the intro.");
		expect(sections[1]?.sectionTitle).toBe("Methods");
		expect(sections[1]?.content).toBe("This is the methods.");
	});

	test("text before first heading becomes a section with no title", () => {
		const md = "Preamble paragraph.\n\n# First Chapter\n\nChapter body.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(2);
		expect(sections[0]?.sectionTitle).toBeUndefined();
		expect(sections[0]?.content).toBe("Preamble paragraph.");
		expect(sections[1]?.sectionTitle).toBe("First Chapter");
		expect(sections[1]?.content).toBe("Chapter body.");
	});

	test("consecutive headings with no body produce no empty sections", () => {
		const md = "# Empty\n\n# Real Section\n\nSome actual content.";
		const sections = splitMarkdownIntoSections(md);

		const nonEmpty = sections.filter((s) => s.content.trim().length > 0);
		expect(nonEmpty).toHaveLength(1);
		expect(nonEmpty[0]?.sectionTitle).toBe("Real Section");
		expect(nonEmpty[0]?.content).toBe("Some actual content.");
	});

	test("h2 and h3 headings also create section boundaries", () => {
		const md =
			"## Section Two\n\nBody text here.\n\n### Subsection\n\nSub body.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(2);
		expect(sections[0]?.sectionTitle).toBe("Section Two");
		expect(sections[0]?.content).toBe("Body text here.");
		expect(sections[1]?.sectionTitle).toBe("Subsection");
		expect(sections[1]?.content).toBe("Sub body.");
	});

	test("multiple paragraphs under one heading stay grouped", () => {
		const md =
			"# Results\n\nParagraph one.\n\nParagraph two.\n\nParagraph three.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(1);
		expect(sections[0]?.sectionTitle).toBe("Results");
		expect(sections[0]?.content).toContain("Paragraph one.");
		expect(sections[0]?.content).toContain("Paragraph two.");
		expect(sections[0]?.content).toContain("Paragraph three.");
	});

	test("inline formatting in headings is stripped from sectionTitle", () => {
		const md = "## **Bold Heading**\n\nBody under the heading.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections[0]?.sectionTitle).toBe("Bold Heading");
		expect(sections[0]?.content).toContain("Body under the heading.");
	});

	test("handles markdown with no headings as single section", () => {
		const md = "Just a paragraph.\n\nAnother paragraph.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(1);
		expect(sections[0]?.sectionTitle).toBeUndefined();
		expect(sections[0]?.content).toContain("Just a paragraph");
	});

	test("handles empty input", () => {
		const sections = splitMarkdownIntoSections("");
		expect(sections).toHaveLength(0);
	});

	test("headings inside code blocks are not treated as section breaks", () => {
		const md =
			"Some intro.\n\n```\n# Not a heading\n```\n\n## Real Heading\n\nBody text.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(2);
		expect(sections[0]?.sectionTitle).toBeUndefined();
		expect(sections[0]?.content).toContain("Not a heading");
		expect(sections[1]?.sectionTitle).toBe("Real Heading");
	});

	test("Setext-style headings are recognized as section breaks", () => {
		const md =
			"Intro text.\n\nSetext Title\n=============\n\nBody under setext.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections.length).toBeGreaterThanOrEqual(2);
		const titledSection = sections.find(
			(s) => s.sectionTitle === "Setext Title"
		);
		expect(titledSection).toBeDefined();
	});

	test("metadata includes sectionTitle when present", () => {
		const md = "## My Section\n\nSection content.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections[0]?.metadata?.sectionTitle).toBe("My Section");
		expect(sections[0]?.sectionTitle).toBe("My Section");
	});

	test("list content is correctly grouped under its heading", () => {
		const md = "# Features\n\n- Item one\n- Item two\n- Item three";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(1);
		expect(sections[0]?.sectionTitle).toBe("Features");
		expect(sections[0]?.content).toContain("Item one");
		expect(sections[0]?.content).toContain("Item two");
		expect(sections[0]?.content).toContain("Item three");
	});

	test("pageNumber increments across sections", () => {
		const md = "# A\n\nFirst.\n\n# B\n\nSecond.\n\n# C\n\nThird.";
		const sections = splitMarkdownIntoSections(md);

		expect(sections).toHaveLength(3);
		expect(sections[0]?.pageNumber).toBe(1);
		expect(sections[1]?.pageNumber).toBe(2);
		expect(sections[2]?.pageNumber).toBe(3);
	});
});
