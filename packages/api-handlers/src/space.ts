import {
	type createSpaceSchema,
	files,
	filesInSpace,
	spaces,
} from "@curiositi/db/schema";
import type { z } from "zod";
import db from "@curiositi/db/client";
import { and, eq, isNull, sql } from "@curiositi/db";
import { createResponse } from "./response";

export async function createSpace(input: z.infer<typeof createSpaceSchema>) {
	try {
		const space = await db.insert(spaces).values(input).returning();
		return createResponse(space, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getSpaces(orgId: string) {
	try {
		const data = await db
			.select()
			.from(spaces)
			.where(eq(spaces.organizationId, orgId));
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getSpaceById(id: string) {
	try {
		const data = await db.select().from(spaces).where(eq(spaces.id, id));
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

type SpaceRow = {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	organizationId: string;
	parentSpaceId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
	depth: number;
};

type SpaceAncestor = {
	id: string;
	name: string;
	icon: string | null;
};

type SpaceWithAncestry = {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	organizationId: string;
	parentSpaceId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
	ancestors: SpaceAncestor[];
};

export async function getSpaceWithAncestry(id: string) {
	try {
		const result = await db.execute<SpaceRow>(sql`
			WITH RECURSIVE ancestry AS (
				SELECT 
					id,
					name,
					description,
					icon,
					organization_id,
					parent_space_id,
					created_at,
					updated_at,
					0 as depth
				FROM curiositi_spaces
				WHERE id = ${id}
				
				UNION ALL
				
				SELECT 
					s.id,
					s.name,
					s.description,
					s.icon,
					s.organization_id,
					s.parent_space_id,
					s.created_at,
					s.updated_at,
					a.depth + 1
				FROM curiositi_spaces s
				INNER JOIN ancestry a ON s.id = a.parent_space_id
			)
			SELECT 
				a.id,
				a.name,
				a.description,
				a.icon,
				a.organization_id as "organizationId",
				a.parent_space_id as "parentSpaceId",
				a.created_at as "createdAt",
				a.updated_at as "updatedAt",
				a.depth
			FROM ancestry a
			ORDER BY a.depth DESC
		`);

		const rows = Array.from(result);

		if (rows.length === 0) {
			return createResponse(null, new Error("Space not found"));
		}

		const currentSpace = rows[rows.length - 1];
		if (!currentSpace) {
			return createResponse(null, new Error("Space not found"));
		}
		const ancestors: SpaceAncestor[] = rows.slice(0, -1).map((row) => ({
			id: row.id,
			name: row.name,
			icon: row.icon,
		}));

		const spaceWithAncestry: SpaceWithAncestry = {
			id: currentSpace.id,
			name: currentSpace.name,
			description: currentSpace.description,
			icon: currentSpace.icon,
			organizationId: currentSpace.organizationId,
			parentSpaceId: currentSpace.parentSpaceId,
			createdAt: currentSpace.createdAt,
			updatedAt: currentSpace.updatedAt,
			ancestors,
		};

		return createResponse(spaceWithAncestry, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function updateSpace(
	id: string,
	input: Partial<z.infer<typeof createSpaceSchema>>
) {
	try {
		const space = await db
			.update(spaces)
			.set(input)
			.where(eq(spaces.id, id))
			.returning();
		return createResponse(space, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function deleteSpace(id: string) {
	try {
		const space = await db.delete(spaces).where(eq(spaces.id, id)).returning();
		return createResponse(space, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getSpaceFiles(spaceId: string) {
	try {
		const data = await db
			.select()
			.from(filesInSpace)
			.where(eq(filesInSpace.spaceId, spaceId));
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getRootSpaces(orgId: string) {
	try {
		const data = await db
			.select()
			.from(spaces)
			.where(
				and(eq(spaces.organizationId, orgId), isNull(spaces.parentSpaceId))
			);
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getChildSpaces(parentSpaceId: string) {
	try {
		const data = await db
			.select()
			.from(spaces)
			.where(eq(spaces.parentSpaceId, parentSpaceId));
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}

export async function getFilesInSpace(spaceId: string) {
	try {
		const data = await db
			.select({
				id: files.id,
				name: files.name,
				path: files.path,
				size: files.size,
				type: files.type,
				organizationId: files.organizationId,
				uploadedById: files.uploadedById,
				status: files.status,
				tags: files.tags,
				processedAt: files.processedAt,
				createdAt: files.createdAt,
				updatedAt: files.updatedAt,
			})
			.from(filesInSpace)
			.innerJoin(files, eq(filesInSpace.fileId, files.id))
			.where(eq(filesInSpace.spaceId, spaceId));
		return createResponse(data, null);
	} catch (error) {
		return createResponse(null, error);
	}
}
