import { files, filesInSpace, fileContents } from "@curiositi/db/schema";
import { createResponse } from "./response";
import db from "@curiositi/db/client";
import { and, eq, notExists, ilike, sql, desc } from "@curiositi/db";
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

export type SearchResult = {
	file: typeof files.$inferSelect;
	score: number;
	matchType: "name" | "content";
};

/**
 * Fast name-only search (no AI, no cost)
 */
export async function searchFilesByName(query: string, orgId: string) {
	try {
		const nameMatches = await db
			.select()
			.from(files)
			.where(
				and(eq(files.organizationId, orgId), ilike(files.name, `%${query}%`))
			);

		const results: SearchResult[] = nameMatches.map((file) => ({
			file,
			score: 1.0,
			matchType: "name" as const,
		}));

		return createResponse(results, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

/**
 * Semantic search using AI embeddings (slower, costs API calls)
 */
export async function searchFilesWithAI(query: string, orgId: string) {
	try {
		const results: SearchResult[] = [];

		// 1. Include name matches
		const nameMatches = await db
			.select()
			.from(files)
			.where(
				and(eq(files.organizationId, orgId), ilike(files.name, `%${query}%`))
			);

		for (const file of nameMatches) {
			results.push({
				file,
				score: 1.0,
				matchType: "name",
			});
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
			.limit(20);

		for (const match of semanticMatches) {
			if (!results.some((r) => r.file.id === match.file.id)) {
				results.push({
					file: match.file,
					score: match.similarity,
					matchType: "content",
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
