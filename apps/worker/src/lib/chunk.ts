import type { PageContent } from "./md";

type ChunkOptions = {
	/** Max tokens per chunk (~4 chars/token). Default: 800 */
	maxChunkSize?: number;
	/** Overlap tokens for context continuity. Default: 100 */
	overlap?: number;
};

export type ChunkWithMetadata = {
	content: string;
	pageNumber: number;
	/** If chunk spans multiple pages, this contains all page numbers */
	pageNumbers?: number[];
};

/**
 * Chunks page content while preserving page number metadata.
 * Optimized for embedding models like OpenAI ada-002.
 */
export function chunkPages(
	pages: PageContent[],
	options: ChunkOptions = {}
): ChunkWithMetadata[] {
	const { maxChunkSize = 800, overlap = 100 } = options;

	const CHARS_PER_TOKEN = 4;
	const maxChars = maxChunkSize * CHARS_PER_TOKEN;
	const overlapChars = overlap * CHARS_PER_TOKEN;

	const chunks: ChunkWithMetadata[] = [];
	let currentChunk = "";
	let currentPageNumbers: number[] = [];

	for (const page of pages) {
		const paragraphs = page.content.split(/\n\n+/);

		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;

			const combinedLength = currentChunk.length + trimmed.length;

			if (combinedLength > maxChars && currentChunk) {
				// Push current chunk with page metadata
				chunks.push({
					content: currentChunk.trim(),
					pageNumber: currentPageNumbers[0] ?? -1,
					...(currentPageNumbers.length > 1 && {
						pageNumbers: currentPageNumbers,
					}),
				});

				// Start new chunk with overlap
				const overlapText = currentChunk.slice(-overlapChars).trim();
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

	// last chunk
	if (currentChunk.trim()) {
		chunks.push({
			content: currentChunk.trim(),
			pageNumber: currentPageNumbers[0] ?? -1,
			...(currentPageNumbers.length > 1 && { pageNumbers: currentPageNumbers }),
		});
	}

	return chunks.filter((c) => c.content.trim().length > 0);
}

/**
 * Simple string chunking (for non-PDF content or when page tracking isn't needed).
 */
export default function chunkText(
	content: string,
	options: ChunkOptions = {}
): string[] {
	const { maxChunkSize = 800, overlap = 100 } = options;

	const CHARS_PER_TOKEN = 4;
	const maxChars = maxChunkSize * CHARS_PER_TOKEN;
	const overlapChars = overlap * CHARS_PER_TOKEN;

	const paragraphs = content.split(/\n\n+/);
	const chunks: string[] = [];
	let currentChunk = "";

	for (const para of paragraphs) {
		const trimmed = para.trim();
		if (!trimmed) continue;

		const combinedLength = currentChunk.length + trimmed.length;

		if (combinedLength > maxChars && currentChunk) {
			chunks.push(currentChunk.trim());
			const overlapText = currentChunk.slice(-overlapChars).trim();
			currentChunk = overlapText ? `${overlapText}\n\n${trimmed}` : trimmed;
		} else {
			currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
		}
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks.filter((c) => c.trim().length > 0);
}
