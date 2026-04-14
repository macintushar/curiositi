import { describe, expect, test } from "bun:test";

function rowToKeyValue(row: string[], headers: string[]): string {
	return headers
		.map((h, i) => `${h}=${row[i] ?? ""}`)
		.filter((_, i) => (row[i] ?? "").length > 0)
		.join("; ");
}

function chunkRows(
	rows: string[][],
	headers: string[],
	maxRowsPerChunk = 10
): {
	content: string;
	embeddingContent: string;
	startRow: number;
	endRow: number;
}[] {
	const chunks: {
		content: string;
		embeddingContent: string;
		startRow: number;
		endRow: number;
	}[] = [];
	let currentRows: string[][] = [];
	let currentStartRow = 1;
	let currentTokens = 0;

	function flushChunk(endIndex: number): void {
		if (currentRows.length === 0) return;
		const headerLine = headers.join(", ");
		const csvLines = currentRows.map((r) => r.join(", ")).join("\n");
		const content = `${headerLine}\n${csvLines}`;
		const kvLines = currentRows
			.map((r) => rowToKeyValue(r, headers))
			.join("\n");
		const embeddingContent = `${headerLine}\n${kvLines}`;
		chunks.push({
			content,
			embeddingContent,
			startRow: currentStartRow,
			endRow: endIndex,
		});
	}

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (!row) continue;
		const rowTokens = row.join(", ").length / 4;

		if (
			currentRows.length >= maxRowsPerChunk ||
			currentTokens + rowTokens > 300
		) {
			flushChunk(currentStartRow + currentRows.length - 1);
			currentRows = [];
			currentStartRow = i + 2;
			currentTokens = 0;
		}

		currentRows.push(row);
		currentTokens += rowTokens;
	}

	flushChunk(currentStartRow + currentRows.length - 1);

	return chunks;
}

describe("Excel chunkRows", () => {
	const headers = ["Name", "Status", "Revenue"];

	test("produces readable CSV content", () => {
		const rows = [
			["Alice", "Active", "1000"],
			["Bob", "Inactive", "500"],
		];

		const chunks = chunkRows(rows, headers);

		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.content).toContain("Name, Status, Revenue");
		expect(chunks[0]?.content).toContain("Alice, Active, 1000");
		expect(chunks[0]?.content).toContain("Bob, Inactive, 500");
	});

	test("produces key=value embeddingContent for each row", () => {
		const rows = [
			["Alice", "Active", "1000"],
			["Bob", "Inactive", "500"],
		];

		const chunks = chunkRows(rows, headers);

		expect(chunks[0]?.embeddingContent).toContain("Name=Alice");
		expect(chunks[0]?.embeddingContent).toContain("Status=Active");
		expect(chunks[0]?.embeddingContent).toContain("Revenue=1000");
		expect(chunks[0]?.embeddingContent).toContain("Name=Bob");
		expect(chunks[0]?.embeddingContent).toContain("Status=Inactive");
	});

	test("content and embeddingContent are different formats", () => {
		const rows = [["Alice", "Active", "1000"]];

		const chunks = chunkRows(rows, headers);

		expect(chunks[0]?.content).not.toBe(chunks[0]?.embeddingContent);
		expect(chunks[0]?.content).toContain(", ");
		expect(chunks[0]?.embeddingContent).toContain("=");
	});

	test("omits empty cell values from key=value lines", () => {
		const rows = [["Alice", "", "1000"]];

		const chunks = chunkRows(rows, headers);

		expect(chunks[0]?.embeddingContent).toContain("Name=Alice");
		expect(chunks[0]?.embeddingContent).not.toContain("Status=");
		expect(chunks[0]?.embeddingContent).toContain("Revenue=1000");
	});

	test("respects row chunk limit and sets correct row ranges", () => {
		const rows = Array.from({ length: 25 }, (_, i) => [
			`Row${i + 1}`,
			"Active",
			String(i * 100),
		]);

		const chunks = chunkRows(rows, headers, 10);

		expect(chunks.length).toBeGreaterThan(1);
		for (const chunk of chunks) {
			expect(chunk.startRow).toBeGreaterThan(0);
			expect(chunk.endRow).toBeGreaterThanOrEqual(chunk.startRow);
		}
	});

	test("first chunk startRow is 1 (1-indexed data rows)", () => {
		const rows = [
			["Alice", "Active", "1000"],
			["Bob", "Inactive", "500"],
		];

		const chunks = chunkRows(rows, headers);

		expect(chunks[0]?.startRow).toBe(1);
		expect(chunks[0]?.endRow).toBe(2);
	});

	test("handles empty rows array", () => {
		const chunks = chunkRows([], headers);

		expect(chunks).toHaveLength(0);
	});

	test("embeddingContent header line matches content header line", () => {
		const rows = [["Alice", "Active", "1000"]];

		const chunks = chunkRows(rows, headers);

		const contentHeader = chunks[0]?.content.split("\n")[0];
		const embedHeader = chunks[0]?.embeddingContent.split("\n")[0];
		expect(contentHeader).toBe(embedHeader);
	});
});

describe("rowToKeyValue", () => {
	test("formats row as key=value pairs", () => {
		const row = ["Alice", "Active", "1200"];
		const result = rowToKeyValue(row, ["Name", "Status", "Revenue"]);
		expect(result).toBe("Name=Alice; Status=Active; Revenue=1200");
	});

	test("skips empty cell values", () => {
		const row = ["Alice", "", "1200"];
		const result = rowToKeyValue(row, ["Name", "Status", "Revenue"]);
		expect(result).toBe("Name=Alice; Revenue=1200");
	});

	test("handles all empty row", () => {
		const row = ["", "", ""];
		const result = rowToKeyValue(row, ["Name", "Status", "Revenue"]);
		expect(result).toBe("");
	});
});
