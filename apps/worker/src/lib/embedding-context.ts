type BuildContextPrefixProps = {
	fileName: string;
	fileType: string;
	pageStart: number;
	pageEnd: number;
	totalPages: number;
	documentTitle?: string;
	sectionTitle?: string;
	csvHeaders?: string[];
	isScanned?: boolean;
	isImage?: boolean;
};

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isImageType(mimeType: string): boolean {
	return IMAGE_MIME_TYPES.includes(mimeType);
}

export function buildContextPrefix(opts: BuildContextPrefixProps): string {
	const lines: string[] = [];

	lines.push(`Document: ${opts.fileName}`);

	if (opts.documentTitle && opts.documentTitle !== opts.fileName) {
		lines.push(`Title: ${opts.documentTitle}`);
	}

	if (opts.isScanned) {
		lines.push("Type: Scanned document");
	}

	if (opts.isImage || isImageType(opts.fileType)) {
		lines.push("Type: Image");
	}

	if (opts.totalPages > 1) {
		if (opts.pageStart === opts.pageEnd) {
			lines.push(`Pages: ${opts.pageStart}`);
		} else {
			lines.push(`Pages: ${opts.pageStart}-${opts.pageEnd}`);
		}
	}

	if (opts.sectionTitle) {
		lines.push(`Section: ${opts.sectionTitle}`);
	}

	if (opts.csvHeaders && opts.csvHeaders.length > 0) {
		lines.push(`Headers: ${opts.csvHeaders.join(", ")}`);
	}

	lines.push("");

	return lines.join("\n");
}
