import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../init";
import { S3Client } from "bun";
import { env } from "../../../env";

import type { TRPCRouterRecord } from "@trpc/server";

import {
	getAllFiles,
	getFileById,
	getFilesNotInSpace,
	deleteFile,
} from "@curiositi/api-handlers";

const fileRouter = {
	getAllInOrg: protectedProcedure.query(async ({ ctx }) => {
		return await getAllFiles(ctx.session.session.activeOrganizationId);
	}),
	getOrphanFiles: protectedProcedure.query(async ({ ctx }) => {
		return await getFilesNotInSpace(ctx.session.session.activeOrganizationId);
	}),
	getById: protectedProcedure
		.input(z.object({ fileId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: file, error } = await getFileById(input.fileId);
			if (error || !file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}
			if (file.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this file",
				});
			}
			return { data: file, error: null };
		}),
	getPresignedUrl: protectedProcedure
		.input(z.object({ fileId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: file, error } = await getFileById(input.fileId);

			if (error || !file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			if (file.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this file",
				});
			}

			const s3Client = new S3Client({
				accessKeyId: env.S3_ACCESS_KEY_ID,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY,
				bucket: env.S3_BUCKET,
				endpoint: env.S3_ENDPOINT,
			});

			const url = s3Client.presign(file.path, {
				method: "GET",
				expiresIn: 3600,
			});

			return { url };
		}),
	delete: protectedProcedure
		.input(z.object({ fileId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { data: file, error } = await getFileById(input.fileId);

			if (error || !file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			if (file.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this file",
				});
			}

			const { error: deleteError } = await deleteFile(input.fileId);
			if (deleteError) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete file from database",
				});
			}

			try {
				const s3Client = new S3Client({
					accessKeyId: env.S3_ACCESS_KEY_ID,
					secretAccessKey: env.S3_SECRET_ACCESS_KEY,
					bucket: env.S3_BUCKET,
					endpoint: env.S3_ENDPOINT,
				});

				await s3Client.delete(file.path);
			} catch (s3Error) {
				console.error(`Failed to delete file from S3: ${file.path}`, s3Error);
			}

			return { success: true };
		}),
} satisfies TRPCRouterRecord;

export default fileRouter;
