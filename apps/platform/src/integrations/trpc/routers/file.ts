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
	searchFilesEnhanced,
	searchFilesWithAI,
	getRecentFiles,
	enqueueFileForProcessing,
	createResponse,
} from "@curiositi/api-handlers";
import logger from "@curiositi/share/logger";

const fileRouter = {
	getAllInOrg: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			})
		)
		.query(async ({ input, ctx }) => {
			return await getAllFiles(
				ctx.session.session.activeOrganizationId,
				input.limit,
				input.offset
			);
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
	search: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				filters: z
					.object({
						fileType: z.string().optional(),
						spaceId: z.string().optional(),
						dateFrom: z.date().optional(),
						dateTo: z.date().optional(),
					})
					.optional(),
				sortBy: z.enum(["relevance", "date", "name", "size"]).optional(),
				limit: z.number().min(1).max(100).optional(),
				offset: z.number().min(0).optional(),
			})
		)
		.query(async ({ input, ctx }) => {
			return await searchFilesEnhanced(
				input.query,
				ctx.session.session.activeOrganizationId,
				{
					filters: input.filters,
					sortBy: input.sortBy,
					limit: input.limit,
					offset: input.offset,
				}
			);
		}),
	searchWithAI: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				filters: z
					.object({
						fileType: z.string().optional(),
						spaceId: z.string().optional(),
						dateFrom: z.date().optional(),
						dateTo: z.date().optional(),
					})
					.optional(),
				limit: z.number().min(1).max(100).optional(),
			})
		)
		.query(async ({ input, ctx }) => {
			return await searchFilesWithAI(
				input.query,
				ctx.session.session.activeOrganizationId,
				{
					filters: input.filters,
					limit: input.limit,
				}
			);
		}),
	getRecent: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(10),
			})
		)
		.query(async ({ input, ctx }) => {
			return await getRecentFiles(
				ctx.session.session.activeOrganizationId,
				input.limit
			);
		}),
	process: protectedProcedure
		.input(
			z.object({
				fileId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { error: enqueueError } = await enqueueFileForProcessing({
				fileId: input.fileId,
				orgId: ctx.session.session.activeOrganizationId,
				qstashToken: env.QSTASH_TOKEN,
				workerUrl: env.WORKER_URL,
			});

			if (enqueueError) {
				logger.error("Error during file enqueue", enqueueError);
				return createResponse(null, enqueueError);
			}

			return createResponse({ success: true }, null);
		}),
} satisfies TRPCRouterRecord;

export default fileRouter;
