import {
	files,
	filesInSpace,
	fileContents,
	spaces,
} from "@curiositi/db/schema";
import { createResponse } from "./response";
import db from "@curiositi/db/client";
import {
	and,
	eq,
	notExists,
	ilike,
	sql,
	desc,
	asc,
	or,
	gte,
	lte,
} from "@curiositi/db";
import { embedText } from "@curiositi/share/ai";

export async function getAllFiles(orgId: string, limit = 50, offset = 0) {
	try {
		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(files)
			.where(eq(files.organizationId, orgId));

		const data = await db
			.select()
			.from(files)
			.where(eq(files.organizationId, orgId))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(files.createdAt));

		return createResponse({ data, total: totalResult[0]?.count ?? 0 }, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getFileById(id: string) {
	try {
		const data = await db.select().from(files).where(eq(files.id, id));
		if (data.length === 0) {
			return createResponse(null, new Error("File not found"));
		}
		return createResponse(data[0], null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getFilesNotInSpace(orgId: string) {
	try {
		const data = await db
			.select()
			.from(files)
			.where(
				and(
					eq(files.organizationId, orgId),
					notExists(
						db
							.select()
							.from(filesInSpace)
							.where(eq(filesInSpace.fileId, files.id))
					)
				)
			);
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function deleteFile(fileId: string) {
	try {
		const result = await db.transaction(async (tx) => {
			await tx.delete(filesInSpace).where(eq(filesInSpace.fileId, fileId));
			const data = await tx
				.delete(files)
				.where(eq(files.id, fileId))
				.returning();
			if (data.length === 0) {
				throw new Error("File not found");
			}
			return data[0];
		});

		return createResponse(result, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export type FileTags = { tags?: string[] };

export type SearchResult = {
	file: typeof files.$inferSelect;
	score: number;
	matchType: "name" | "content" | "tag" | "space";
	spaceName?: string | null;
	spaceId?: string | null;
};

export type SearchSortBy = "relevance" | "date" | "name" | "size";

/**
 * Enhanced search across files, tags, and spaces
 */
/**
 * Get recent files for a user/organization
 */
export async function getRecentFiles(orgId: string, limit = 10) {
	try {
		// Use a subquery to deduplicate files first, then sort by recency
		const deduped = db
			.selectDistinctOn([files.id], {
				file: files,
				spaceId: spaces.id,
				spaceName: spaces.name,
			})
			.from(files)
			.leftJoin(filesInSpace, eq(filesInSpace.fileId, files.id))
			.leftJoin(spaces, eq(spaces.id, filesInSpace.spaceId))
			.where(eq(files.organizationId, orgId))
			.orderBy(files.id)
			.as("deduped");

		const recentFiles = await db
			.select()
			.from(deduped)
			.orderBy(desc(deduped.file.createdAt))
			.limit(limit);

		const results: SearchResult[] = recentFiles.map((match) => ({
			file: match.file,
			score: 1.0,
			matchType: "name" as const,
			spaceName: match.spaceName,
			spaceId: match.spaceId,
		}));

		return createResponse(results, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

/**
 * Semantic search using AI embeddings with enhanced metadata
 */
export async function searchFilesWithAI(
	query: string,
	orgId: string,
	options?: {
		limit?: number;
	}
) {
	try {
		const results: SearchResult[] = [];
		const limit = options?.limit ?? 20;

		// 2. Semantic search via embeddings
		const { embedding } = await embedText({ text: query, provider: "openai" });

		const semanticMatches = await db
			.select({
				file: files,
				similarity:
					sql<number>`1 - (${fileContents.embeddedContent} <=> ${JSON.stringify(embedding)}::vector)`.as(
						"similarity"
					),
			})
			.from(fileContents)
			.innerJoin(files, eq(fileContents.fileId, files.id))
			.where(eq(files.organizationId, orgId))
			.orderBy(
				desc(
					sql`1 - (${fileContents.embeddedContent} <=> ${JSON.stringify(embedding)}::vector)`
				)
			)
			.limit(limit);

		// Get spaces for semantic matches (batched query to avoid N+1)
		const newMatches = semanticMatches.filter(
			(m) => !results.some((r) => r.file.id === m.file.id)
		);

		if (newMatches.length > 0) {
			const fileIds = newMatches.map((m) => m.file.id);
			const spaceInfos = await db
				.select({
					fileId: filesInSpace.fileId,
					spaceId: spaces.id,
					spaceName: spaces.name,
				})
				.from(filesInSpace)
				.leftJoin(spaces, eq(spaces.id, filesInSpace.spaceId))
				.where(
					sql`${filesInSpace.fileId} IN (${sql.join(
						fileIds.map((id) => sql`${id}`),
						sql`, `
					)})`
				);

			const spaceMap = new Map(
				spaceInfos.map((s) => [
					s.fileId,
					{ spaceId: s.spaceId, spaceName: s.spaceName },
				])
			);

			for (const match of newMatches) {
				const space = spaceMap.get(match.file.id);
				results.push({
					file: match.file,
					score: match.similarity,
					matchType: "content",
					spaceName: space?.spaceName ?? null,
					spaceId: space?.spaceId ?? null,
				});
			}
		}

		results.sort((a, b) => b.score - a.score);

		return createResponse(results, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

// Keep for backward compatibility
export const searchFiles = searchFilesWithAI;
