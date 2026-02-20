import type { BunFile, S3File } from "bun";
import * as pdf2md from "@opendocsg/pdf2md";

export type PageContent = {
	pageNumber: number;
	content: string;
};

export type PdfMetadata = {
	title?: string;
	author?: string;
	subject?: string;
	keywords?: string;
	creator?: string;
	producer?: string;
	creationDate?: string;
	modDate?: string;
	[key: string]: unknown;
};

export type PdfParseResult = {
	metadata: PdfMetadata;
	pages: PageContent[];
};

export default async function parsePdf(
	file: S3File | BunFile
): Promise<PdfParseResult> {
	const fileBuffer = await file.arrayBuffer();

	let metadata: PdfMetadata = {};
	const pages: PageContent[] = [];

	await pdf2md.default(fileBuffer, {
		metadataParsed: (meta) => {
			metadata = meta.info as PdfMetadata;
		},
		documentParsed: (_doc, parsedPages) => {
			for (const page of parsedPages) {
				// Extract text content from all items on this page
				const content = page.items
					.map((item) => ("str" in item ? item.str : ""))
					.join(" ")
					.replace(/\s+/g, " ")
					.trim();

				pages.push({
					pageNumber: page.index + 1, // 1-indexed page numbers
					content,
				});
			}
		},
	});

	return { metadata, pages };
}
