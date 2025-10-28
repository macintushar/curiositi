---
title: Ingestion & Vector Pipeline
description: This document describes the end-to-end ingestion process from file upload to searchable vectorized chunks.
---

# Ingestion & Vector Pipeline

This document describes the end-to-end ingestion process from file upload to searchable vectorized chunks.

## Supported File Types

Defined via constants (`SUPPORTED_FILE_TYPES`, `PDF_FILE_TYPE`, `OFFICE_FILE_TYPES`). Includes:

- PDF
- Office (Word, PowerPoint, Excel – parsed via `officeparser`)
- Plain text / UTF-8

## Pipeline Steps

| Step | Component                   | Description                                                               |
| ---- | --------------------------- | ------------------------------------------------------------------------- |
| 1    | Route `POST /files/upload`  | Accepts multipart form (file, space_id)                                   |
| 2    | Service `uploadFileHandler` | Persists raw file + metadata (ID, space linkage)                          |
| 3    | `processAndStoreDocument`   | Detects type, extracts text, logs progress                                |
| 4    | Extraction                  | PDF: `WebPDFLoader`; Office: `parseOfficeAsync`; else raw buffer → string |
| 5    | Chunking                    | `textSplitter().splitText(text)` produces semantic chunks                 |
| 6    | Embedding                   | `generateEmbeddings(chunks)` returns per-chunk vectors                    |
| 7    | Storage                     | `addDocumentsToVectorStore` called for each chunk with metadata           |

## Error Handling

- Non-supported MIME: warn + skip.
- Empty text or no chunks: warn + skip.
- Exceptions wrapped with `tryCatch` utility; failures throw at final stage.

## Vector Store Interface

Expected to provide at minimum:

- `addDocumentsToVectorStore(content, spaceId, fileId, userId, vector, originalFilename)`
- Query path (not shown in file) used by search service for similarity retrieval.

## Extending File Support

1. Add MIME to constants list.
2. Implement extraction branch (e.g., CSV parser → structured to text).
3. Ensure large binary handling—avoid loading entire extremely large files if streaming support is added later.

## Embeddings Strategy

- Batch generation via `generateEmbeddings(chunks)`.
- Provider selection currently implicit; future improvement: per-user embedding model mapping.

## Observability Suggestions

- Add timing metrics for extraction vs embedding vs storage.
- Track chunk count distribution for capacity planning.

## Potential Enhancements

- Deduplicate identical chunks (hash-based) before embedding.
- Async background processing queue for large files.
- Adaptive chunking based on model token context.
