const CSV_MIME_TYPES = ["text/csv"];

export function isCsvMimeType(mimeType: string): boolean {
	return CSV_MIME_TYPES.includes(mimeType);
}

export function extractCsvHeaders(content: string): string[] {
	const firstLine = content.split("\n")[0];
	if (!firstLine) return [];
	return firstLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
}
