import type { Processor } from "./types";
import PPTX2Json from "pptx2json";
import type { PageContent } from "../lib/md";

type SlideData = {
	slideNumber: number;
	title?: string;
	textContent: string;
	hasImages: boolean;
};

function extractSlideContent(json: Record<string, unknown>): SlideData[] {
	const slides: SlideData[] = [];
	const slideKeys = Object.keys(json)
		.filter((key) => key.startsWith("ppt/slides/slide"))
		.sort((a, b) => {
			const numA = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
			const numB = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
			return numA - numB;
		});

	for (const slideKey of slideKeys) {
		const slideData = json[slideKey];
		if (!slideData || typeof slideData !== "object") continue;

		const slideObj = slideData as Record<string, unknown>;
		const slideNumber =
			parseInt(slideKey.match(/\d+/)?.[0] ?? "0", 10) || slides.length + 1;

		const { title, text, hasImages } = parseSlideXml(slideObj);
		const textContent = text.trim();

		slides.push({
			slideNumber,
			title: title || undefined,
			textContent,
			hasImages,
		});
	}

	return slides;
}

function parseSlideXml(slideObj: Record<string, unknown>): {
	title: string;
	text: string;
	hasImages: boolean;
} {
	let title = "";
	let text = "";
	let hasImages = false;

	function walkXml(obj: unknown, depth = 0) {
		if (depth > 20) return;

		if (Array.isArray(obj)) {
			for (const item of obj) {
				walkXml(item, depth + 1);
			}
			return;
		}

		if (typeof obj !== "object" || obj === null) return;

		const record = obj as Record<string, unknown>;

		if (record["a:t"] !== undefined) {
			const textContent = String(record["a:t"]);
			if (textContent.trim()) {
				if (!title && depth < 8) {
					title = textContent.trim();
				} else {
					text += ` ${textContent.trim()}`;
				}
			}
		}

		if (record["a:tx"] !== undefined) {
			walkXml(record["a:tx"], depth + 1);
		}

		if (record["p:txBody"] !== undefined) {
			walkXml(record["p:txBody"], depth + 1);
		}

		if (record["a:p"] !== undefined) {
			walkXml(record["a:p"], depth + 1);
		}

		if (record["p:pic"] !== undefined || record.pic !== undefined) {
			hasImages = true;
		}

		if (record["a:blip"] !== undefined) {
			hasImages = true;
		}

		for (const key of Object.keys(record)) {
			if (
				!["a:t", "a:tx", "p:txBody", "a:p", "p:pic", "pic", "a:blip"].includes(
					key
				)
			) {
				walkXml(record[key], depth + 1);
			}
		}
	}

	walkXml(slideObj);

	return { title: title.trim(), text: text.trim(), hasImages };
}

const powerpointProcessor: Processor = async ({ file, fileData, logger }) => {
	const { id: fileId } = fileData;

	logger.debug("Processing PowerPoint document", {
		fileId,
		processor: "powerpoint",
	});

	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const pptx2json = new PPTX2Json();
		const json = await pptx2json.buffer2json(buffer);

		const slides = extractSlideContent(json);

		const pages: PageContent[] = [];

		for (const slide of slides) {
			let content = slide.textContent;

			if (!content && slide.hasImages) {
				logger.debug("Slide has images but no text, skipping AI for now", {
					fileId,
					slideNumber: slide.slideNumber,
				});
				content = `[Slide ${slide.slideNumber} contains visual content]`;
			}

			if (!content) {
				continue;
			}

			pages.push({
				pageNumber: pages.length + 1,
				content,
				sectionTitle: slide.title || `Slide ${slide.slideNumber}`,
				metadata: {
					slideNumber: String(slide.slideNumber),
				},
			});
		}

		if (pages.length === 0) {
			logger.info("No meaningful content found in PowerPoint file", {
				fileId,
				processor: "powerpoint",
			});
		}

		logger.info("PowerPoint document processed successfully", {
			fileId,
			slideCount: slides.length,
			pageChunkCount: pages.length,
			processor: "powerpoint",
		});

		return pages;
	} catch (error) {
		logger.error("Failed to process PowerPoint document", {
			fileId,
			error,
			processor: "powerpoint",
		});
		throw error;
	}
};

export default powerpointProcessor;
