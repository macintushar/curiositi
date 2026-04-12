import type { Processor } from "./types";
import mammoth from "mammoth";
import { extractDocumentText } from "@curiositi/share/ai";
import type { PageContent } from "../lib/md";

function parseHtmlSections(html: string): PageContent[] {
	const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
	const sections: PageContent[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	match = headingRegex.exec(html);
	while (match !== null) {
		const headingContent = (match[2] ?? "").replace(/<[^>]*>/g, "").trim();
		const startIdx = match.index;

		if (startIdx > lastIndex) {
			const precedingContent = html
				.slice(lastIndex, startIdx)
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim();
			if (precedingContent) {
				sections.push({
					pageNumber: sections.length + 1,
					content: precedingContent,
				});
			}
		}

		sections.push({
			pageNumber: sections.length + 1,
			content: "",
			sectionTitle: headingContent,
		});

		lastIndex = headingRegex.lastIndex;
		match = headingRegex.exec(html);
	}

	if (lastIndex < html.length) {
		const remainingContent = html
			.slice(lastIndex)
			.replace(/<[^>]*>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		if (remainingContent) {
			const lastSection = sections[sections.length - 1];
			if (lastSection && !lastSection.content) {
				lastSection.content = remainingContent;
			} else {
				sections.push({
					pageNumber: sections.length + 1,
					content: remainingContent,
				});
			}
		}
	}

	if (sections.length === 0 && html.trim()) {
		sections.push({
			pageNumber: 1,
			content: html
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim(),
		});
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
			logger.info("No text found via mammoth, falling back to AI extraction", {
				fileId,
				processor: "word",
			});

			const aiResult = await extractDocumentText({
				file: arrayBuffer,
				provider: "openai",
				mediaType: fileData.type,
			});

			logger.info("Word document extracted via AI successfully", {
				fileId,
				processor: "word",
			});

			return [
				{
					pageNumber: 1,
					content: aiResult.text,
					metadata: { extractedVia: "ai" },
				},
			];
		}

		const sections = parseHtmlSections(html);

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
