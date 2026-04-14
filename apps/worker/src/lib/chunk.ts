import { getEncoding } from "js-tiktoken";
import type { PageContent } from "./md";
import { buildContextPrefix } from "./embedding-context";
import {
	PDF_TYPE,
	WORD_TYPES,
	EXCEL_TYPES,
	IMAGE_TYPES,
	POWERPOINT_TYPES,
} from "@curiositi/share/constants";

const CSV_TYPES = ["text/csv"];

type ChunkStrategy = {
	maxChunkSize: number;
	overlap: number;
};

function resolveStrategy(
	fileType: string,
	pages: PageContent[],
	explicit: { maxChunkSize?: number; overlap?: number }
): ChunkStrategy {
	const hasExplicit =
		explicit.maxChunkSize !== undefined || explicit.overlap !== undefined;

	if (hasExplicit) {
		return {
			maxChunkSize: explicit.maxChunkSize ?? 300,
			overlap: explicit.overlap ?? 60,
		};
	}

	const isAiExtracted = pages.every((p) => p.metadata?.extractedVia === "ai");
	if (isAiExtracted || IMAGE_TYPES.includes(fileType)) {
		return { maxChunkSize: 1000, overlap: 0 };
	}

	if (EXCEL_TYPES.includes(fileType) || CSV_TYPES.includes(fileType)) {
		return { maxChunkSize: 300, overlap: 0 };
	}

	if (
		fileType === PDF_TYPE ||
		WORD_TYPES.includes(fileType) ||
		fileType.startsWith("text/")
	) {
		return { maxChunkSize: 500, overlap: 80 };
	}

	if (POWERPOINT_TYPES.includes(fileType)) {
		return { maxChunkSize: 300, overlap: 60 };
	}

	return { maxChunkSize: 300, overlap: 60 };
}

type ChunkOptions = {
	maxChunkSize?: number;
	overlap?: number;
	fileName?: string;
	fileType?: string;
	documentTitle?: string;
	csvHeaders?: string[];
};

export type ChunkWithMetadata = {
	content: string;
	embeddedText: string;
	pageNumber: number;
	pageNumbers?: number[];
	sectionTitle?: string;
	sourceMetadata?: Record<string, string>;
};

let encoder: ReturnType<typeof getEncoding> | null = null;

function getEncoder() {
	if (!encoder) {
		encoder = getEncoding("cl100k_base");
	}
	return encoder;
}

function countTokens(text: string): number {
	const enc = getEncoder();
	return enc.encode(text).length;
}

export function chunkPages(
	pages: PageContent[],
	options: ChunkOptions = {}
): ChunkWithMetadata[] {
	const { fileName = "", fileType = "", documentTitle, csvHeaders } = options;

	const { maxChunkSize, overlap } = resolveStrategy(fileType, pages, {
		maxChunkSize: options.maxChunkSize,
		overlap: options.overlap,
	});

	const chunks: ChunkWithMetadata[] = [];
	let currentChunk = "";
	let currentPageNumbers: number[] = [];
	let currentSectionTitle: string | undefined;
	let currentSourceMetadata: Record<string, string> | undefined;

	const totalPages = pages.length;

	function flushPending(): void {
		if (!currentChunk.trim()) return;
		const pageStart = currentPageNumbers[0] ?? -1;
		const pageEnd =
			currentPageNumbers[currentPageNumbers.length - 1] ?? pageStart;
		const prefix = buildContextPrefix({
			fileName,
			fileType,
			pageStart,
			pageEnd,
			totalPages,
			documentTitle,
			sectionTitle: currentSectionTitle,
			csvHeaders,
		});
		chunks.push({
			content: currentChunk.trim(),
			embeddedText: prefix + currentChunk.trim(),
			pageNumber: pageStart,
			...(currentPageNumbers.length > 1 && { pageNumbers: currentPageNumbers }),
			...(currentSectionTitle && { sectionTitle: currentSectionTitle }),
			...(currentSourceMetadata && { sourceMetadata: currentSourceMetadata }),
		});
		currentChunk = "";
		currentPageNumbers = [];
		currentSectionTitle = undefined;
		currentSourceMetadata = undefined;
	}

	for (const page of pages) {
		if (page.embeddingContent !== undefined) {
			flushPending();
			if (!page.content.trim()) continue;
			const prefix = buildContextPrefix({
				fileName,
				fileType,
				pageStart: page.pageNumber,
				pageEnd: page.pageNumber,
				totalPages,
				documentTitle,
				sectionTitle: page.sectionTitle,
				csvHeaders,
			});
			chunks.push({
				content: page.content.trim(),
				embeddedText: prefix + page.embeddingContent.trim(),
				pageNumber: page.pageNumber,
				...(page.sectionTitle && { sectionTitle: page.sectionTitle }),
				...(page.metadata && { sourceMetadata: page.metadata }),
			});
			continue;
		}

		const paragraphs = page.content.split(/\n\n+/);

		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;

			const combinedTokens = countTokens(`${currentChunk}\n\n${trimmed}`);

			if (combinedTokens > maxChunkSize && currentChunk) {
				const pageStart = currentPageNumbers[0] ?? -1;
				const pageEnd =
					currentPageNumbers[currentPageNumbers.length - 1] ?? pageStart;

				const prefix = buildContextPrefix({
					fileName,
					fileType,
					pageStart,
					pageEnd,
					totalPages,
					documentTitle,
					sectionTitle: currentSectionTitle,
					csvHeaders,
				});

				chunks.push({
					content: currentChunk.trim(),
					embeddedText: prefix + currentChunk.trim(),
					pageNumber: pageStart,
					...(currentPageNumbers.length > 1 && {
						pageNumbers: currentPageNumbers,
					}),
					...(currentSectionTitle && { sectionTitle: currentSectionTitle }),
					...(currentSourceMetadata && {
						sourceMetadata: currentSourceMetadata,
					}),
				});

				if (overlap > 0) {
					const overlapTokens = getEncoder()
						.encode(currentChunk)
						.slice(-overlap);
					const overlapText = getEncoder().decode(overlapTokens).trim();
					currentChunk = overlapText ? `${overlapText}\n\n${trimmed}` : trimmed;
				} else {
					currentChunk = trimmed;
				}
				currentPageNumbers = [page.pageNumber];
				currentSectionTitle = page.sectionTitle;
				currentSourceMetadata = page.metadata;
			} else {
				if (!currentChunk) {
					currentSectionTitle = page.sectionTitle;
					currentSourceMetadata = page.metadata;
				}
				currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
				if (!currentPageNumbers.includes(page.pageNumber)) {
					currentPageNumbers.push(page.pageNumber);
				}
			}
		}
	}

	flushPending();

	return chunks.filter((c) => c.content.trim().length > 0);
}

export default function chunkText(
	content: string,
	options: ChunkOptions = {}
): ChunkWithMetadata[] {
	const {
		maxChunkSize = 300,
		overlap = 60,
		fileName = "",
		fileType = "",
		documentTitle,
	} = options;

	const paragraphs = content.split(/\n\n+/);
	const chunks: ChunkWithMetadata[] = [];
	let currentChunk = "";

	for (const para of paragraphs) {
		const trimmed = para.trim();
		if (!trimmed) continue;

		const combinedTokens = countTokens(`${currentChunk}\n\n${trimmed}`);

		if (combinedTokens > maxChunkSize && currentChunk) {
			const prefix = buildContextPrefix({
				fileName,
				fileType,
				pageStart: 1,
				pageEnd: 1,
				totalPages: 1,
				documentTitle,
			});

			chunks.push({
				content: currentChunk.trim(),
				embeddedText: prefix + currentChunk.trim(),
				pageNumber: 1,
			});

			if (overlap > 0) {
				const overlapTokens = getEncoder().encode(currentChunk).slice(-overlap);
				const overlapText = getEncoder().decode(overlapTokens).trim();
				currentChunk = overlapText ? `${overlapText}\n\n${trimmed}` : trimmed;
			} else {
				currentChunk = trimmed;
			}
		} else {
			currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
		}
	}

	if (currentChunk.trim()) {
		const prefix = buildContextPrefix({
			fileName,
			fileType,
			pageStart: 1,
			pageEnd: 1,
			totalPages: 1,
			documentTitle,
		});

		chunks.push({
			content: currentChunk.trim(),
			embeddedText: prefix + currentChunk.trim(),
			pageNumber: 1,
		});
	}

	return chunks.filter((c) => c.content.trim().length > 0);
}
