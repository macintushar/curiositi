---
title: Ingestion & Vector Pipeline
description: This document describes the end-to-end ingestion process from file upload to searchable vectorized chunks.
---

This document describes the end-to-end ingestion process from file upload to searchable vectorized chunks.

## Supported File Types

Defined via server constants (`SUPPORTED_FILE_TYPES`, `PDF_FILE_TYPE`, `OFFICE_FILE_TYPES`, `TEXT_FILE_TYPES`). Exact MIME types allowed:

- PDF
  - application/pdf
- Office (OpenXML)
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
  - application/vnd.openxmlformats-officedocument.presentationml.presentation (.pptx)
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
- OpenDocument Formats (ODF)
  - application/vnd.oasis.opendocument.text (.odt)
  - application/vnd.oasis.opendocument.presentation (.odp)
  - application/vnd.oasis.opendocument.spreadsheet (.ods)
- Text
  - text/plain
  - text/csv
  - text/markdown

## Pipeline Steps

| Step | Component                   | Description                                                               |
| ---- | --------------------------- | ------------------------------------------------------------------------- |
| 1    | Route `POST /files/upload`  | Accepts multipart form (file, space_id)                                   |
| 2    | Service `uploadFileHandler` | Persists raw file + metadata (ID, space linkage)                          |
| 3    | `processAndStoreDocument`   | Detects type, extracts text, logs progress                                |
| 4    | Extraction                  | PDF: `WebPDFLoader`; Office: `parseOfficeAsync`; else raw buffer → string |
| 5    | Chunking                    | `textSplitter().splitText(text)` produces fixed-size chunks (default 500 chars, 50 overlap) |
| 6    | Embedding                   | `generateEmbeddings(chunks)` returns per-chunk vectors (1024-dim)         |
| 7    | Storage                     | `addDocumentsToVectorStore` called for each chunk with metadata           |

## Error Handling

- Non-supported MIME: warn and skip (logged with filename and type).
- Empty text or no chunks: warn and skip.
- Exceptions wrapped with `tryCatch` utility; route returns 500 on failure of processing.
- Upload route validates type early using SUPPORTED_FILE_TYPES and returns a 400 with a helpful message.

## Vector Store Interface

Implemented in `apps/server/src/lib/vectorStore.ts`:

- `addDocumentsToVectorStore(content, spaceId, fileId, userId, vector, originalFilename)`
- `generateEmbeddings(chunks: string[]): Promise<number[][]>`
- Query path is used by docSearch tool for similarity retrieval.

## Extending File Support

1. Add MIME to constants list.
2. Implement extraction branch (e.g., CSV parser → structured to text).
3. Ensure large binary handling—avoid loading entire extremely large files if streaming support is added later.

## Embeddings Strategy

- Batch generation via `generateEmbeddings(chunks)`.
- Embedding vectors are 1024-dimensional (db/schema.ts, vector({ dimensions: 1024 })).
- Default embedding model: OPENAI text-embedding-3-small (configurable via OPENAI_EMBEDDING_MODEL).
- Provider selection currently implicit; future improvement: per-user embedding model mapping.

## Observability Suggestions

- Add timing metrics for extraction vs embedding vs storage.
- Track chunk count distribution for capacity planning.

## Potential Enhancements

- Deduplicate identical chunks (hash-based) before embedding.
- Async background processing queue for large files.
- Adaptive chunking based on model token context.
