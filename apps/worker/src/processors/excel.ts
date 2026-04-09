import type { Processor } from "./types";
import * as XLSX from "xlsx";
import { extractDocumentText } from "@curiositi/share/ai";
import type { PageContent } from "../lib/md";

const MAX_SHEETS = 50;
const MAX_ROWS_PER_CHUNK = 10;

function sheetToRows(sheet: XLSX.WorkSheet): {
	headers: string[];
	rows: string[][];
} {
	const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
		header: 1,
		defval: "",
	});

	if (json.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = (json[0] ?? []).map((h) => String(h).trim());
	const rows = json
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
		const buffer = Buffer.from(arrayBuffer);

		const workbook = XLSX.read(buffer, { type: "buffer" });
		const sheetNames = workbook.SheetNames.slice(0, MAX_SHEETS);

		if (workbook.SheetNames.length > MAX_SHEETS) {
			logger.warn("Excel file has many sheets, truncating", {
				fileId,
				totalSheets: workbook.SheetNames.length,
				processedSheets: MAX_SHEETS,
			});
		}

		const pages: PageContent[] = [];

		for (const sheetName of sheetNames) {
			const sheet = workbook.Sheets[sheetName];
			if (!sheet) continue;
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
			logger.info(
				"No meaningful data found via xlsx, falling back to AI extraction",
				{ fileId, processor: "excel" }
			);

			const aiResult = await extractDocumentText({
				file: arrayBuffer,
				provider: "openai",
				mediaType: fileData.type,
			});

			logger.info("Excel document extracted via AI successfully", {
				fileId,
				processor: "excel",
			});

			return [
				{
					pageNumber: 1,
					content: aiResult.text,
					metadata: { extractedVia: "ai" },
				},
			];
		}

		logger.info("Excel document processed successfully", {
			fileId,
			sheetCount: sheetNames.length,
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
