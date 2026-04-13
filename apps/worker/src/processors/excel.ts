import type { Processor } from "./types";
import ExcelJS from "exceljs";
import type { PageContent } from "../lib/md";
const MAX_SHEETS = 50;
const MAX_ROWS_PER_CHUNK = 10;

function cellToString(cell: ExcelJS.CellValue | undefined): string {
	if (cell === undefined || cell === null) {
		return "";
	}

	if (cell instanceof Date) {
		return cell.toISOString();
	}

	if (typeof cell === "object") {
		if ("text" in cell && typeof cell.text === "string") {
			return cell.text;
		}

		if ("result" in cell && cell.result !== undefined && cell.result !== null) {
			return String(cell.result);
		}

		if ("richText" in cell && Array.isArray(cell.richText)) {
			return cell.richText.map((part) => part.text).join("");
		}

		if ("hyperlink" in cell && typeof cell.hyperlink === "string") {
			return "text" in cell && cell.text ? String(cell.text) : cell.hyperlink;
		}
	}

	return String(cell);
}

function sheetToRows(sheet: ExcelJS.Worksheet): {
	headers: string[];
	rows: string[][];
} {
	const allRows: string[][] = [];

	sheet.eachRow({ includeEmpty: false }, (row) => {
		const rowValues = Array.isArray(row.values)
			? row.values.slice(1).map((cell) => cellToString(cell).trim())
			: [];
		allRows.push(rowValues);
	});

	if (allRows.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = (allRows[0] ?? []).map((h) => String(h).trim());
	const rows = allRows
		.slice(1)
		.map((row) => (row ?? []).map((cell) => String(cell).trim()));

	return { headers, rows };
}

function chunkRows(
	rows: string[][],
	headers: string[]
): { content: string; startRow: number; endRow: number }[] {
	const chunks: { content: string; startRow: number; endRow: number }[] = [];
	let currentRows: string[][] = [];
	let currentStartRow = 1;
	let currentTokens = 0;

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (!row) continue;
		const rowStr = row.join(", ");
		const rowTokens = rowStr.length / 4;

		if (
			currentRows.length >= MAX_ROWS_PER_CHUNK ||
			currentTokens + rowTokens > 300
		) {
			if (currentRows.length > 0) {
				const headerLine = headers.join(", ");
				const content = `${headerLine}\n${currentRows.map((r) => r.join(", ")).join("\n")}`;
				chunks.push({
					content,
					startRow: currentStartRow,
					endRow: currentStartRow + currentRows.length - 1,
				});
			}
			currentRows = [];
			currentStartRow = i + 1;
			currentTokens = 0;
		}

		currentRows.push(row);
		currentTokens += rowTokens;
	}

	if (currentRows.length > 0) {
		const headerLine = headers.join(", ");
		const content = `${headerLine}\n${currentRows.map((r) => r.join(", ")).join("\n")}`;
		chunks.push({
			content,
			startRow: currentStartRow,
			endRow: currentStartRow + currentRows.length - 1,
		});
	}

	return chunks;
}

const excelProcessor: Processor = async ({ file, fileData, logger }) => {
	const { id: fileId } = fileData;

	logger.debug("Processing Excel document", {
		fileId,
		processor: "excel",
	});

	try {
		const arrayBuffer = await file.arrayBuffer();

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(arrayBuffer);
		const sheets = workbook.worksheets.slice(0, MAX_SHEETS);

		if (workbook.worksheets.length > MAX_SHEETS) {
			logger.warn("Excel file has many sheets, truncating", {
				fileId,
				totalSheets: workbook.worksheets.length,
				processedSheets: MAX_SHEETS,
			});
		}

		const pages: PageContent[] = [];

		for (const sheet of sheets) {
			const sheetName = sheet.name;
			const { headers, rows } = sheetToRows(sheet);

			if (rows.length === 0) {
				continue;
			}

			const rowChunks = chunkRows(rows, headers);

			for (const chunk of rowChunks) {
				pages.push({
					pageNumber: pages.length + 1,
					content: chunk.content,
					sectionTitle: sheetName,
					metadata: {
						sheetName,
						startRow: String(chunk.startRow),
						endRow: String(chunk.endRow),
						headers: headers.join(","),
					},
				});
			}
		}

		if (pages.length === 0) {
			logger.info("No meaningful data found in Excel file", {
				fileId,
				processor: "excel",
			});
		}

		logger.info("Excel document processed successfully", {
			fileId,
			sheetCount: sheets.length,
			chunkCount: pages.length,
			processor: "excel",
		});

		return pages;
	} catch (error) {
		logger.error("Failed to process Excel document", {
			fileId,
			error,
			processor: "excel",
		});
		throw error;
	}
};

export default excelProcessor;
