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

export type SearchFilters = {
	fileType?: string;
	spaceId?: string;
	dateFrom?: Date;
	dateTo?: Date;
};

export type SearchSortBy = "relevance" | "date" | "name" | "size";

function buildSearchWhereClause(
	query: string,
	orgId: string,
	filters?: SearchFilters
) {
	const conditions: (
		| ReturnType<typeof eq>
		| ReturnType<typeof ilike>
		| ReturnType<typeof sql>
		| ReturnType<typeof or>
		| ReturnType<typeof gte>
		| ReturnType<typeof lte>
	)[] = [eq(files.organizationId, orgId)];

	// Name match
	const nameMatch = ilike(files.name, `%${query}%`);

	// Tag match (JSONB array search)
	const tagMatch = sql<boolean>`EXISTS (
		SELECT 1 FROM jsonb_array_elements_text(${files.tags}->'tags') AS tag
		WHERE tag ILIKE ${`%${query}%`}
	)`;

	// Space name match (via join)
	const spaceMatch = ilike(spaces.name, `%${query}%`);

	// Combine search conditions
	const searchCondition = or(nameMatch, tagMatch, spaceMatch);
	if (searchCondition) {
		conditions.push(searchCondition);
	}

	// Apply filters
	if (filters?.fileType) {
		conditions.push(ilike(files.type, `%${filters.fileType}%`));
	}
	if (filters?.spaceId) {
		conditions.push(eq(filesInSpace.spaceId, filters.spaceId));
	}
	if (filters?.dateFrom) {
		conditions.push(gte(files.createdAt, filters.dateFrom));
	}
	if (filters?.dateTo) {
		conditions.push(lte(files.createdAt, filters.dateTo));
	}

	return and(...conditions);
}

function getSortOrder(sortBy: SearchSortBy) {
	switch (sortBy) {
		case "date":
			return desc(files.createdAt);
		case "name":
			return asc(files.name);
		case "size":
			return desc(files.size);
		default:
			return desc(files.createdAt);
	}
}

/**
 * Enhanced search across files, tags, and spaces
 */
export async function searchFilesEnhanced(
	query: string,
	orgId: string,
	options?: {
		filters?: SearchFilters;
		sortBy?: SearchSortBy;
		limit?: number;
		offset?: number;
	}
) {
	try {
		const limit = options?.limit ?? 50;
		const offset = options?.offset ?? 0;
		const sortBy = options?.sortBy ?? "relevance";

		const whereClause = buildSearchWhereClause(query, orgId, options?.filters);

		// Get files with their spaces (DISTINCT ON to avoid duplicates when file is in multiple spaces)
		const matches = await db
			.selectDistinctOn([files.id], {
				file: files,
				spaceId: spaces.id,
				spaceName: spaces.name,
			})
			.from(files)
			.leftJoin(filesInSpace, eq(filesInSpace.fileId, files.id))
			.leftJoin(spaces, eq(spaces.id, filesInSpace.spaceId))
			.where(whereClause)
			.orderBy(files.id, getSortOrder(sortBy))
			.limit(limit)
			.offset(offset);

		const results: SearchResult[] = matches.map((match) => {
			let matchType: SearchResult["matchType"] = "name";
			let score = 0.5;

			// Determine match type and calculate relevance score
			const queryLower = query.toLowerCase();
			const fileNameLower = match.file.name.toLowerCase();

			if (match.spaceName?.toLowerCase().includes(queryLower)) {
				matchType = "space";
				score = 0.7;
			}

			// Higher score for exact name matches
			if (fileNameLower === queryLower) {
				score = 0.95;
			} else if (fileNameLower.startsWith(queryLower)) {
				score = 0.85;
			} else if (fileNameLower.includes(queryLower)) {
				score = 0.75;
			}

			return {
				file: match.file,
				score,
				matchType,
				spaceName: match.spaceName,
				spaceId: match.spaceId,
			};
		});

		return createResponse(results, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

/**
 * Get recent files for a user/organization
 */
export async function getRecentFiles(orgId: string, limit = 10) {
	try {
		const recentFiles = await db
			.selectDistinctOn([files.id], {
				file: files,
				spaceId: spaces.id,
				spaceName: spaces.name,
			})
			.from(files)
			.leftJoin(filesInSpace, eq(filesInSpace.fileId, files.id))
			.leftJoin(spaces, eq(spaces.id, filesInSpace.spaceId))
			.where(eq(files.organizationId, orgId))
			.orderBy(files.id, desc(files.createdAt))
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
 * Fast name-only search (no AI, no cost) - DEPRECATED: Use searchFilesEnhanced
 */
export async function searchFilesByName(query: string, orgId: string) {
	return searchFilesEnhanced(query, orgId);
}

/**
 * Semantic search using AI embeddings with enhanced metadata
 */
export async function searchFilesWithAI(
	query: string,
	orgId: string,
	options?: {
		filters?: SearchFilters;
		limit?: number;
	}
) {
	try {
		const results: SearchResult[] = [];
		const limit = options?.limit ?? 20;

		// 1. Include enhanced name/tag/space matches
		const enhancedMatches = await searchFilesEnhanced(query, orgId, {
			...options,
			limit: 10,
		});

		if (enhancedMatches.data) {
			results.push(...enhancedMatches.data);
		}

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
