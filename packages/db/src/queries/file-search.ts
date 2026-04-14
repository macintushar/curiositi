import db from "../client";
import { files, fileContents, filesInSpace } from "../schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export type FileSearchResult = {
	fileId: string;
	fileName: string;
	fileType: string;
	content: string;
	similarity: number;
	sectionTitle?: string;
	pageNumber?: number | number[];
	sheetName?: string;
	rowStart?: number;
	rowEnd?: number;
	headers?: string;
	slideNumber?: number;
	extractedVia?: string;
	chunkIndex?: number;
};

export async function searchFileContents(
	organizationId: string,
	embedding: number[],
	query: string,
	options: {
		maxResults?: number;
		minSimilarity?: number;
		spaceIds?: string[];
		fileTypes?: string[];
		fileIds?: string[];
	} = {}
): Promise<FileSearchResult[]> {
	const { maxResults = 5, minSimilarity = 0.3, fileIds, spaceIds } = options;

	const embeddingStr = `[${embedding.join(",")}]`;

	const fileConditions = [eq(files.organizationId, organizationId)];
	if (fileIds && fileIds.length > 0) {
		fileConditions.push(inArray(fileContents.fileId, fileIds));
	}

	const semanticScore = sql<number>`(1 - (${fileContents.embeddedContent} <=> ${embeddingStr}::vector))`;
	const lexicalScore = sql<number>`ts_rank(to_tsvector('english', ${fileContents.content}), plainto_tsquery('english', ${query}))`;
	const combinedScore = sql<number>`(0.7 * (1 - (${fileContents.embeddedContent} <=> ${embeddingStr}::vector)) + 0.3 * ts_rank(to_tsvector('english', ${fileContents.content}), plainto_tsquery('english', ${query})))`;

	let baseQuery = db
		.select({
			fileId: fileContents.fileId,
			fileName: files.name,
			fileType: files.type,
			content: fileContents.content,
			metadata: fileContents.metadata,
			semanticScore,
			lexicalScore,
			similarity: combinedScore,
		})
		.from(fileContents)
		.innerJoin(files, eq(fileContents.fileId, files.id))
		.$dynamic();

	if (spaceIds && spaceIds.length > 0) {
		baseQuery = baseQuery.innerJoin(
			filesInSpace,
			and(
				eq(filesInSpace.fileId, files.id),
				inArray(filesInSpace.spaceId, spaceIds)
			)
		);
	}

	const results = await baseQuery
		.where(and(...fileConditions))
		.orderBy(
			sql`(0.7 * (1 - (${fileContents.embeddedContent} <=> ${embeddingStr}::vector)) + 0.3 * ts_rank(to_tsvector('english', ${fileContents.content}), plainto_tsquery('english', ${query}))) DESC`
		)
		.limit(maxResults);

	return results
		.filter((r) => r.similarity >= minSimilarity)
		.map((r) => {
			const meta = r.metadata as Record<string, unknown> | null;
			const result: FileSearchResult = {
				fileId: r.fileId,
				fileName: r.fileName,
				fileType: r.fileType,
				content: r.content,
				similarity: r.similarity,
			};
			if (meta?.section_title) {
				result.sectionTitle = meta.section_title as string;
			}
			if (meta?.page_number !== undefined && meta.page_number !== null) {
				result.pageNumber = meta.page_number as number | number[];
			}
			if (meta?.sheet_name) {
				result.sheetName = meta.sheet_name as string;
			}
			if (meta?.row_start !== undefined && meta.row_start !== null) {
				result.rowStart = Number(meta.row_start);
			}
			if (meta?.row_end !== undefined && meta.row_end !== null) {
				result.rowEnd = Number(meta.row_end);
			}
			if (meta?.headers) {
				result.headers = meta.headers as string;
			}
			if (meta?.slide_number !== undefined && meta.slide_number !== null) {
				result.slideNumber = Number(meta.slide_number);
			}
			if (meta?.extracted_via) {
				result.extractedVia = meta.extracted_via as string;
			}
			if (meta?.chunk_index !== undefined && meta.chunk_index !== null) {
				result.chunkIndex = meta.chunk_index as number;
			}
			return result;
		});
}
