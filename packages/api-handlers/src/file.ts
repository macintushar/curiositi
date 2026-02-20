import {
	files,
	filesInSpace,
	fileContents,
	spaces,
} from "@curiositi/db/schema";
import { createResponse } from "./response";
import db from "@curiositi/db/client";
import { and, eq, notExists, sql, desc, ilike } from "@curiositi/db";
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

/**
 * Enhanced search across files, tags, and spaces
 */
/**
 * Get recent files for a user/organization
 */
export async function getRecentFiles(orgId: string, limit = 10) {
	try {
		// Use a subquery to deduplicate files first, then sort by recency
		const deduped = await db
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
			.limit(limit);

		const results: SearchResult[] = deduped.map((match) => ({
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

		const MIN_SIMILARITY_THRESHOLD = 0.5;

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

		const ids = new Set();
		const newMatches = semanticMatches.filter((m) => {
			if (m.similarity < MIN_SIMILARITY_THRESHOLD) return false;
			if (ids.has(m.file.id)) {
				return false;
			} else {
				ids.add(m.file.id);
				return true;
			}
		});

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

export async function searchFiles(
	query: string,
	orgId: string,
	options?: { limit?: number }
) {
	try {
		const limit = options?.limit ?? 15;
		const resultsMap = new Map<string, SearchResult>();

		const filenameMatches = await db
			.select({
				file: files,
				spaceId: spaces.id,
				spaceName: spaces.name,
			})
			.from(files)
			.leftJoin(filesInSpace, eq(filesInSpace.fileId, files.id))
			.leftJoin(spaces, eq(spaces.id, filesInSpace.spaceId))
			.where(
				and(eq(files.organizationId, orgId), ilike(files.name, `%${query}%`))
			)
			.limit(limit);

		for (const match of filenameMatches) {
			resultsMap.set(match.file.id, {
				file: match.file,
				score: 1.0,
				matchType: "name",
				spaceName: match.spaceName,
				spaceId: match.spaceId,
			});
		}

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

		if (semanticMatches.length > 0) {
			const fileIds = semanticMatches.map((m) => m.file.id);
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

			const MIN_SIMILARITY_THRESHOLD = 0.5;

			for (const match of semanticMatches) {
				if (match.similarity < MIN_SIMILARITY_THRESHOLD) continue;

				const existing = resultsMap.get(match.file.id);
				if (existing) {
					if (match.similarity > existing.score) {
						existing.score = match.similarity;
						existing.matchType = "content";
					}
				} else {
					const space = spaceMap.get(match.file.id);
					resultsMap.set(match.file.id, {
						file: match.file,
						score: match.similarity,
						matchType: "content",
						spaceName: space?.spaceName ?? null,
						spaceId: space?.spaceId ?? null,
					});
				}
			}
		}

		const results = Array.from(resultsMap.values())
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);

		return createResponse(results, null);
	} catch (error) {
		return createResponse(null, error);
	}
}
