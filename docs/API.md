# API Endpoints for Curiositi

Curiositi has 2 main endpoints:

1. `/api/v1/upload` - Upload a document for ingestion into the vector store.
2. `/api/v1/query` - Submit a query to the RAG agent.

## API Endpoints

### `POST /api/v1/upload`

Upload a document for ingestion into the vector store.

- **Content-Type:** `multipart/form-data` (field: `file`)
- **Success (200):**
  ```json
  { "message": "File '<filename>' processed successfully." }
  ```
- **Errors:**
  - `415 Unsupported Media Type` – unsupported file type
  - `500 Internal Server Error` – processing error

### `POST /api/v1/query`

Submit a query to the RAG agent.

- **Content-Type:** `application/json`
- **Request Schema:**
  ```json
  {
    "input": "Your question here",
    "model": "optional_model_name",
    "session_id": "unique_session_identifier"
  }
  ```
- **Success (200):**
  ```json
  {
    "data": {
      "answer": "...",
      "metadata": {
        "docQueries": ["..."],
        "webQueries": ["..."],
        "docResults": ["..."],
        "webResults": ["..."],
        "strategy": "direct" | "retrieve"
      }
    }
  }
  ```
- **Error (500):**
  ```json
  { "error": { "message": "...", "details": "..." } }
  ```
