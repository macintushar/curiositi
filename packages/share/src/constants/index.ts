export const STORAGE_PATH_PREFIX = "../../storage/";

export const TEXT_FILE_TYPES = [
	"text/plain",
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

export const ALLOWED_MIME_TYPES = [
	...TEXT_FILE_TYPES,
	...IMAGE_TYPES,
	PDF_TYPE,
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
