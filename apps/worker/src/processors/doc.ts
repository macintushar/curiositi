import type { Processor } from "./types";
import parsePdf from "../lib/md";
import { TEXT_FILE_TYPES } from "@curiositi/share/constants";

function isTextMimeType(mimeType: string): boolean {
	return TEXT_FILE_TYPES.includes(mimeType) || mimeType.startsWith("text/");
}

const docProcessor: Processor = async ({ file, fileData, logger }) => {
	const { type: filetype, id: fileId } = fileData;

	if (isTextMimeType(filetype)) {
		logger.debug("Processing text-based file", {
			fileId,
			filetype,
			processor: "doc",
		});

		try {
			const textContent = await file.text();
			logger.info("Text file processed successfully", {
				fileId,
				contentLength: textContent.length,
				processor: "doc",
			});

			return [{ pageNumber: 1, content: textContent }];
		} catch (textError) {
			logger.error("Failed to read text file", {
				fileId,
				error: textError,
				processor: "doc",
			});
			throw textError;
		}
	}

	logger.debug("Parsing PDF to markdown", { fileId, processor: "doc" });

	try {
		const { pages } = await parsePdf(file);
		logger.info("PDF parsed successfully", {
			fileId,
			pageCount: pages.length,
			processor: "doc",
		});

		return pages;
	} catch (parseError) {
		logger.error("Failed to parse PDF", {
			fileId,
			error: parseError,
			processor: "doc",
		});
		throw parseError;
	}
};

export default docProcessor;
