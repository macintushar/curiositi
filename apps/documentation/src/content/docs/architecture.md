---
title: Architecture
description: This document provides a formal architectural reference for Curiositi.
---

This document provides a formal architectural reference for Curiositi.

## Monorepo Structure

| Path             | Responsibility                                               |
| ---------------- | ------------------------------------------------------------ |
| `apps/web`       | User-facing Next.js application (auth, chat, file UI)        |
| `apps/server`    | Hono API server (auth, ingestion, search, LLM orchestration) |
| `apps/documentation` | Documentation site (Astro Starlight)                        |
| `packages/share` | Shared TypeScript types/utilities                            |

## Execution Runtimes

- **Bun:** Primary runtime for server and scripts (fast startup, TS native).
- **Node-Compatible:** Next.js runs in its own environment (can be Bun or Node depending on deployment target; ensure feature parity for APIs used).

### Routing

Located in `apps/server/src/routes`. Each file exports a sub-router mounted under `/api/v1` in `api.ts`. Middleware injects authenticated `user` and `session` context.

### Services

Encapsulate domain logic (`services/*`). Example: `ingestion.ts` handles extraction, chunking, embedding, and vector insertion.

### Vector Store & Embeddings

`lib/vectorStore` (referenced by ingestion) coordinates embedding generation and storing document vectors keyed by `spaceId`, `fileId`, `userId`.

### Auth

`lib/auth.ts` uses a session-based model; middleware attaches user context or returns 401 early.

### Validation

`@hono/zod-validator` + schema definitions (`types/schemas.ts`) enforce shape at boundaries.

## Frontend Layers

```text
Next.js App Router
  ├─ actions/ (server actions for mutations)
  ├─ services/ (client API wrappers)
  ├─ stores/ (Zustand state: chat, threads, settings)
  ├─ components/ (UI primitives + feature modules)
  ├─ hooks/ (data + state abstractions)
  └─ instrumentation/ (observability)
```

### Styling

Tailwind CSS v4 + component patterns (variant utilities). Keep global overrides minimal; prefer composition.

### Data Fetching

TanStack Query orchestrates caching. Server actions for critical mutations may coexist with fetch wrappers.

## Ingestion Pipeline (Summary)

1. Receive upload (`routes/files.ts` → `uploadFileHandler`).
2. Extract text depending on MIME (PDF via `WebPDFLoader`, Office via `officeparser`, plaintext fallback).
3. Split text into chunks with `textSplitter()`.
4. Generate embeddings for each chunk.
5. Persist chunk + embedding metadata to vector store.

## Search & Retrieval

`routes/search.ts` calls `searchHandler` with filters; backend merges retrieval and LLM output formatting.

## Threading

Threads represent conversation containers: created via `POST /api/v1/threads` and messages fetched via `/api/v1/threads/:id/messages`.

## Extensibility Principles

- **Add a Route:** Create router file, mount in `api.ts`, define request schema, implement service.
- **Add Ingestion Type:** Extend detection + extraction, update supported MIME constants.
- **Add Provider:** Extend `llms.ts` and model registry; expose config in user settings.

## Build & Dev Tooling

- **Turbo:** Orchestrates pipelined tasks (`dev`, `build`, `lint`, `typecheck`).
- **Bun:** Accelerated dependency install + runtime.
- **Docker:** Containerization via per-app `Dockerfile`.

## Observability

- Sentry DSNs (web + server) optional for tracing and error logging.

## Security Considerations

- Strict 401 gating in API middleware.
- Embedding and model provider keys are per-user (stored via user service).
- File type allowlist controls ingestion risk.

## Future Enhancements (Suggested)

- Pluggable vector backends (pgvector / external managed service).
- Rate limiting middleware.
- Structured audit logging for admin actions.

Refer to [Ingestion](ingestion.md) and [LLM & Agent Layer](llm-agent.md) for deeper flows.
