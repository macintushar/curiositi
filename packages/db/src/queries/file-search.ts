import db from "../client";
import { files, fileContents } from "../schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export type FileSearchResult = {
	fileId: string;
	fileName: string;
	fileType: string;
	content: string;
	similarity: number;
};

export async function searchFileContents(
	organizationId: string,
	embedding: number[],
	options: {
		maxResults?: number;
		minSimilarity?: number;
		spaceIds?: string[];
		fileTypes?: string[];
		fileIds?: string[];
	} = {}
): Promise<FileSearchResult[]> {
	const { maxResults = 5, minSimilarity = 0.5, fileIds } = options;

	const embeddingStr = `[${embedding.join(",")}]`;

	const fileConditions = [eq(files.organizationId, organizationId)];
	if (fileIds && fileIds.length > 0) {
		fileConditions.push(inArray(fileContents.fileId, fileIds));
	}

	const results = await db
		.select({
			fileId: fileContents.fileId,
			fileName: files.name,
			fileType: files.type,
			content: fileContents.content,
			similarity:
				sql<number>`1 - (${fileContents.embeddedContent} <=> ${embeddingStr}::vector)`.as(
					"similarity"
				),
		})
		.from(fileContents)
		.innerJoin(files, eq(fileContents.fileId, files.id))
		.where(and(...fileConditions))
		.orderBy(sql`${fileContents.embeddedContent} <=> ${embeddingStr}::vector`)
		.limit(maxResults);

	return results
		.map((r) => ({
			fileId: r.fileId,
			fileName: r.fileName,
			fileType: r.fileType,
			content: r.content,
			similarity: r.similarity,
		}))
		.filter((r) => r.similarity >= minSimilarity);
}
