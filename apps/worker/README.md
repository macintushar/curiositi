# @curiositi/worker

The file processing worker for Curiositi. Built with [Hono](https://hono.dev/) on [Bun](https://bun.sh/).

## What it does

The worker receives file processing jobs (via QStash) and handles:

- Downloading files from S3
- Extracting text from documents (PDF, plain text, markdown, CSV, HTML, XML, JSON) and images (JPEG, PNG, WebP, GIF)
- Chunking text into 800-token segments with 100-token overlap
- Generating vector embeddings and storing them in PostgreSQL (pgvector)

## Endpoints

| Method | Path            | Description                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/`             | Health text response                 |
| GET    | `/health`       | JSON health check (`{ status: ok }`) |
| POST   | `/process-file` | Process a file (`{ fileId, orgId }`) |

## Development

```sh
bun run dev
```

Runs on **http://localhost:3040**.
