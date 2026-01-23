import type { Logger } from "../create-logger";
import type { BunFile, S3File } from "bun";
import type { PageContent } from "../lib/md";
import type { files } from "@curiositi/db/schema";

export type FileData = typeof files.$inferSelect;

export type ProcessorContext = {
	file: S3File | BunFile;
	fileData: FileData;
	fileId: string;
	logger: Logger;
};

export type Processor = (context: ProcessorContext) => Promise<PageContent[]>;
