import { files, filesInSpace } from "@curiositi/db/schema";
import { createResponse } from "./response";
import db from "@curiositi/db/client";
import { and, eq, notExists } from "@curiositi/db";

export async function getAllFiles(orgId: string) {
	try {
		const data = await db
			.select()
			.from(files)
			.where(eq(files.organizationId, orgId));
		return createResponse(data, null);
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
		await db.delete(filesInSpace).where(eq(filesInSpace.fileId, fileId));
		const data = await db.delete(files).where(eq(files.id, fileId)).returning();
		if (data.length === 0) {
			return createResponse(null, new Error("File not found"));
		}
		return createResponse(data[0], null);
	} catch (error) {
		return createResponse(null, error);
	}
}
