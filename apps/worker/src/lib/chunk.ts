import { getEncoding } from "js-tiktoken";
import type { PageContent } from "./md";
import { buildContextPrefix } from "./embedding-context";

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
	const {
		maxChunkSize = 300,
		overlap = 60,
		fileName = "",
		fileType = "",
		documentTitle,
		csvHeaders,
	} = options;

	const chunks: ChunkWithMetadata[] = [];
	let currentChunk = "";
	let currentPageNumbers: number[] = [];

	const totalPages = pages.length;

	for (const page of pages) {
		const paragraphs = page.content.split(/\n\n+/);

		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;

			const combinedTokens = countTokens(`${currentChunk}\n\n${trimmed}`);

			if (combinedTokens > maxChunkSize && currentChunk) {
				const pageStart = currentPageNumbers[0] ?? -1;
				const pageEnd =
					currentPageNumbers[currentPageNumbers.length - 1] ?? pageStart;
				const sectionTitle = page.sectionTitle;

				const prefix = buildContextPrefix({
					fileName,
					fileType,
					pageStart,
					pageEnd,
					totalPages,
					documentTitle,
					sectionTitle,
					csvHeaders,
				});

				chunks.push({
					content: currentChunk.trim(),
					embeddedText: prefix + currentChunk.trim(),
					pageNumber: pageStart,
					...(currentPageNumbers.length > 1 && {
						pageNumbers: currentPageNumbers,
					}),
				});

				const overlapTokens = getEncoder().encode(currentChunk).slice(-overlap);
				const overlapText = getEncoder().decode(overlapTokens).trim();
				currentChunk = overlapText ? `${overlapText}\n\n${trimmed}` : trimmed;
				currentPageNumbers = [page.pageNumber];
			} else {
				currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
				if (!currentPageNumbers.includes(page.pageNumber)) {
					currentPageNumbers.push(page.pageNumber);
				}
			}
		}
	}

	if (currentChunk.trim()) {
		const pageStart = currentPageNumbers[0] ?? -1;
		const pageEnd =
			currentPageNumbers[currentPageNumbers.length - 1] ?? pageStart;
		const lastPage = pages[pages.length - 1];
		const sectionTitle = lastPage?.sectionTitle;

		const prefix = buildContextPrefix({
			fileName,
			fileType,
			pageStart,
			pageEnd,
			totalPages,
			documentTitle,
			sectionTitle,
			csvHeaders,
		});

		chunks.push({
			content: currentChunk.trim(),
			embeddedText: prefix + currentChunk.trim(),
			pageNumber: pageStart,
			...(currentPageNumbers.length > 1 && { pageNumbers: currentPageNumbers }),
		});
	}

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

			const overlapTokens = getEncoder().encode(currentChunk).slice(-overlap);
			const overlapText = getEncoder().decode(overlapTokens).trim();
			currentChunk = overlapText ? `${overlapText}\n\n${trimmed}` : trimmed;
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
