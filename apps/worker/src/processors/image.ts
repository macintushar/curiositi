import type { Processor } from "./types";
import { describeImage } from "@curiositi/share/ai";
import { LARGE_IMAGE_THRESHOLD } from "@curiositi/share/constants";

const imageProcessor: Processor = async ({ file, fileData, logger }) => {
	const { id: fileId, size: fileSize } = fileData;

	logger.debug("Processing image file", {
		fileId,
		fileSize,
		processor: "image",
	});

	if (fileSize > LARGE_IMAGE_THRESHOLD) {
		logger.warn("Processing large image file", {
			fileId,
			fileSize,
			threshold: LARGE_IMAGE_THRESHOLD,
			processor: "image",
			message: `Image size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds recommended threshold (${LARGE_IMAGE_THRESHOLD / 1024 / 1024}MB)`,
		});
	}

	try {
		logger.debug("Generating AI description for image", {
			fileId,
			processor: "image",
		});

		const arrayBuffer = await file.arrayBuffer();

		const { text: description } = await describeImage({
			image: arrayBuffer,
			provider: "openai",
		});

		logger.info("Image description generated successfully", {
			fileId,
			descriptionLength: description.length,
			processor: "image",
		});

		return [
			{
				pageNumber: 1,
				content: description,
			},
		];
	} catch (error) {
		logger.error("Failed to process image", {
			fileId,
			error,
			processor: "image",
		});
		throw error;
	}
};

export default imageProcessor;
