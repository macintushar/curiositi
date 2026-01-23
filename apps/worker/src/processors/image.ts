import type { Processor } from "./types";
import { describeImage } from "../lib/ai";

const imageProcessor: Processor = async ({ file, fileData, logger }) => {
	const { id: fileId, type: mimeType } = fileData;

	logger.debug("Processing image file", { fileId, processor: "image" });

	try {
		const arrayBuffer = await file.arrayBuffer();
		const base64Image = Buffer.from(arrayBuffer).toString("base64");
		const dataUri = `data:${mimeType};base64,${base64Image}`;

		logger.debug("Generating AI description for image", {
			fileId,
			processor: "image",
		});

		const { text: description } = await describeImage({
			image: dataUri,
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
