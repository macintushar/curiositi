import type { Processor } from "./types";
import docProcessor from "./doc";
import imageProcessor from "./image";
import {
	TEXT_FILE_TYPES,
	PDF_TYPE,
	IMAGE_TYPES,
} from "@curiositi/share/constants";

export { docProcessor, imageProcessor };
export type { Processor, ProcessorContext, FileData } from "./types";

const PROCESSOR_MAP: Record<string, Processor> = {
	[PDF_TYPE]: docProcessor,
	...Object.fromEntries(TEXT_FILE_TYPES.map((type) => [type, docProcessor])),
	...Object.fromEntries(IMAGE_TYPES.map((type) => [type, imageProcessor])),
};

export function getProcessor(mimeType: string): Processor | null {
	if (PROCESSOR_MAP[mimeType]) {
		return PROCESSOR_MAP[mimeType];
	}

	if (mimeType.startsWith("text/")) {
		return docProcessor;
	}

	return null;
}

export function isSupportedMimeType(mimeType: string): boolean {
	return getProcessor(mimeType) !== null;
}
