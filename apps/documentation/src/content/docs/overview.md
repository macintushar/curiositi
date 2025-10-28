---
title: Curiositi Overview
description: Curiositi is an Elastic-licensed, developer-focused knowledge and AI interaction platform.
---

# Curiositi Overview

Curiositi is an Elastic-licensed, developer-focused knowledge and AI interaction platform. It provides ingestion of user documents, vector-based semantic search, configurable multi-provider LLM access, and a modern web UI—all in a Bun + Turbo monorepo.

## Core Capabilities

- **Document Ingestion & Embedding:** Process PDF, Office, and text assets; chunk, embed, and store for retrieval.
- **Semantic & Filtered Search:** Query across spaces, files, and threads with provider-selectable model execution.
- **Threaded Conversations:** Persist and retrieve multi-turn context.
- **Configurable Model Providers:** OpenAI, Anthropic, OpenRouter (extensible).
- **User Spaces & File Scoping:** Logical isolation for retrieval and access.
- **Extensible API Layer:** Hono-based modular routing with Zod validation.

## Technology Stack

- **Runtime:** Bun (scripts + server) / Node-compatible environment.
- **Backend:** Hono framework, Drizzle ORM, custom vector store utilities.
- **Frontend:** Next.js (App Router), React 19, Tailwind CSS.
- **Embeddings & LLMs:** External APIs via provider keys (configurable per user).
- **Build & Orchestration:** Turbo, Docker, optional Vercel deployment.

## Data Flow Summary

1. User uploads a file (PDF / Office / text) → server receives multipart form.
2. File stored + processed: text extraction → chunking → embedding generation.
3. Chunks + embeddings inserted into vector store (space + file scoped metadata).
4. User issues search/chat request with optional filters (space_ids, file_ids, thread_id).
5. Backend composes retrieval + model generation; returns structured result.

## License

Curiositi is Elastic licensed. Review `LICENSE.md` for grant and restrictions. Do not redistribute under incompatible terms.

## When to Extend

| Need               | Extension Point                                               |
| ------------------ | ------------------------------------------------------------- |
| New model provider | `apps/server/src/lib/llms.ts` & model registry                |
| New ingestion type | `apps/server/src/services/ingestion.ts` or extraction helpers |
| New API route      | `apps/server/src/routes` + service layer                      |
| New UI workflow    | `apps/web/src/app` + `components` + `services`                |

## Next Steps

- Start with [Getting Started](getting-started.md)
- Review [Architecture](architecture.md)
- Explore the [API Reference](api/README.md)
