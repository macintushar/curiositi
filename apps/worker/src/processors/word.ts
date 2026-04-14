import type { Processor } from "./types";
import mammoth from "mammoth";
import TurndownService from "turndown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Heading, Content } from "mdast";
import type { PageContent } from "../lib/md";

const turndown = new TurndownService({
	headingStyle: "atx",
	bulletListMarker: "-",
});

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

const wordProcessor: Processor = async ({ file, fileData, logger }) => {
	const { id: fileId } = fileData;

	logger.debug("Processing Word document", {
		fileId,
		processor: "word",
	});

	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await mammoth.convertToHtml({ buffer });

		if (result.messages.length > 0) {
			logger.debug("Mammoth conversion messages", {
				fileId,
				messages: result.messages,
			});
		}

		const html = result.value;
		const hasContent = html.replace(/<[^>]*>/g, "").trim().length > 10;

		if (!hasContent) {
			logger.info("No text found via mammoth, returning empty result", {
				fileId,
				processor: "word",
			});

			return [];
		}

		const markdown = turndown.turndown(html);

		if (!markdown.trim()) {
			return [];
		}

		const sections = splitMarkdownIntoSections(markdown);

		logger.info("Word document processed successfully", {
			fileId,
			sectionCount: sections.length,
			processor: "word",
		});

		return sections;
	} catch (error) {
		logger.error("Failed to process Word document", {
			fileId,
			error,
			processor: "word",
		});
		throw error;
	}
};

export default wordProcessor;
