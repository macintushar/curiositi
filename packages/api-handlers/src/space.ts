import {
	type createSpaceSchema,
	filesInSpace,
	spaces,
} from "@curiositi/db/schema";
import type { z } from "zod";
import db from "@curiositi/db/client";
import { eq } from "@curiositi/db";
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

export async function updateSpace(
	id: string,
	input: z.infer<typeof createSpaceSchema>
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
