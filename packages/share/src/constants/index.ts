export const STORAGE_PATH_PREFIX = "../../storage/";

export const TEXT_FILE_TYPES = [
	"text/plain",
	"plaintext",
	"text/markdown",
	"text/csv",
	"text/html",
	"text/xml",
	"application/json",
	"application/xml",
];

export const PDF_TYPE = "application/pdf";

export const IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

export const WORD_TYPES = [
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/msword",
];

export const EXCEL_TYPES = [
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const POWERPOINT_TYPES = [
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.ms-powerpoint",
];

export const OFFICE_TYPES = [
	...WORD_TYPES,
	...EXCEL_TYPES,
	...POWERPOINT_TYPES,
];

export const ALLOWED_MIME_TYPES = [
	...TEXT_FILE_TYPES,
	...IMAGE_TYPES,
	PDF_TYPE,
	...OFFICE_TYPES,
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const LARGE_IMAGE_THRESHOLD = 5 * 1024 * 1024; // 5MB

export const CAT_LOGO = `
  /\\__/\\
 (^ . ^)
 (")_("))~
 `;

export enum QUEUE_NAMES {
	INGEST = "curiositi-ingest-queue",
}

export enum QUEUE_PROVIDER {
	QSTASH = "qstash",
	LOCAL = "local",
}
