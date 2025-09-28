<p align="center">
  <img src="./apps/web/src/assets/logo.svg" alt="Curiositi Logo" width="180" />
</p>

<h1 align="center">Curiositi — Open‑Source AI Knowledge Workspace</h1>

<p align="center">
  Upload documents, organize them into spaces, and chat with an agent that answers using your knowledge and the web.
</p>

<p align="center">
  <a href="https://github.com/macintushar/curiositi/stargazers"><img src="https://img.shields.io/github/stars/macintushar/curiositi?style=for-the-badge" alt="GitHub stars"></a>
  <a href="https://github.com/macintushar/curiositi/graphs/commit-activity"><img src="https://img.shields.io/github/commit-activity/m/macintushar/curiositi?style=for-the-badge" alt="Commit activity"></a>
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/licence-Elastic_V2-blue?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <a href="https://docs.curiositi.xyz"><strong>Docs</strong></a>
  •
  <a href="https://docs.curiositi.xyz/docs/roadmap">Roadmap</a>
  •
  <a href="https://github.com/macintushar/curiositi/issues/new/choose">Report an issue</a>
  •
  <a href="https://github.com/macintushar/curiositi/discussions">Discussions</a>
</p>

<hr />

## Why Curiositi?

Curiositi is a private, self‑hostable Retrieval‑Augmented Generation (RAG) workspace. It lets teams unify unstructured knowledge, search it with vector embeddings, optionally enrich with web results, and generate reasoned answers with modern LLMs — all with secure authentication and a clean UI.

⭐ If you like the project, consider giving it a star. It helps a ton!

## Features

- **Secure auth**: better‑auth with cross‑subdomain cookies; optional email verification via Resend.
- **Spaces**: create/delete spaces to organize files and scope retrieval.
- **File ingestion**: PDF, Office, Markdown/CSV/TXT; automatic text extraction, chunking, and embeddings.
- **Vector search**: OpenAI embeddings in Postgres using `pgvector` via Drizzle.
- **RAG chat**: an agent plans queries, searches your docs and the web in parallel, then synthesizes an answer with reasoning and follow‑ups.
- **Web search**: Firecrawl search integration.
- **Providers**: OpenAI, Anthropic, and OpenRouter; configurable per‑user API keys.
- **Configs API**: surfaces enabled providers and supported file types to the UI.
- **Observability**: optional Sentry instrumentation.

### Supported file types

- PDF (`application/pdf`)
- Office: `docx`, `pptx`, `xlsx`, `odt`, `odp`, `ods`
- Text: `text/plain`, `text/csv`, `text/markdown`

### Model providers and examples

- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-5`, `gpt-5-mini`, `o3`, `o4-mini`
- **Anthropic**: `claude-opus-4-1`, `claude-sonnet-4`, `claude-3-5-sonnet`
- **OpenRouter**: curated/free models via OpenRouter

---

## Codebase Overview

The Curiositi project is structured as a monorepo, containing several key components:

- **apps/web**: This is the Next.js 15 app router UI, responsible for the frontend interface of Curiositi.
- **apps/server**: This is the Bun + Hono API server, handling backend operations and API requests.
- **apps/docs**: Contains the Docusaurus documentation for Curiositi, providing comprehensive guides and references.
- **packages/share**: Houses shared TypeScript types used across different parts of the application.

### Key Features

- **Spaces**: Manage and organize files into spaces for better retrieval and management.
- **File Ingestion**: Supports various file types including PDF, Office documents, and text files, with automatic text extraction and chunking.
- **Vector Search**: Utilizes OpenAI embeddings stored in Postgres using `pgvector` for efficient search capabilities.
- **RAG Chat**: An agent that plans queries, searches documents and the web, and synthesizes answers with reasoning.
- **Web Search**: Integration with Firecrawl for web search and content extraction.
- **Providers**: Supports OpenAI, Anthropic, and OpenRouter, with configurable API keys per user.
- **Observability**: Optional Sentry instrumentation for monitoring and logging.

### Roadmap

The roadmap has been moved to the [documentation site](https://docs.curiositi.xyz/docs/roadmap) for better accessibility and updates.

---

## Getting Started

### Documentation

For comprehensive guides and detailed information about setting up and using Curiositi, please refer to our [Documentation](https://docs.curiositi.xyz). The documentation covers:

- **[Getting Started](https://docs.curiositi.xyz/docs/getting-started)**: Step-by-step instructions to set up your environment and start using Curiositi.
- **[Overview](https://docs.curiositi.xyz/docs/overview)**: Detailed descriptions of the features available in Curiositi.
- **[API Reference](https://docs.curiositi.xyz/docs/api)**: In-depth information about the API endpoints and how to interact with them.
- **[Contributing](https://docs.curiositi.xyz/docs/contributing)**: Guidelines for contributing to the project.

### Prerequisites

- Bun 1.2.0+
- PostgreSQL 16+ with `pgvector` extension enabled

### Install

```bash
bun install
```

### Database

Enable pgvector and run migrations:

```bash
# From repo root
bun run db:migrate
```

`apps/server/drizzle/0000_good_secret_warriors.sql` ensures the `vector` extension exists.

### Develop

Run both apps via turborepo:

```bash
bun run dev
```

Or individually:

```bash
# API server
cd apps/server
bun run dev

# Web app
cd apps/web
bun run dev
```

The web app rewrites `/api/v1/*` to `SERVER_URL` (see `apps/web/next.config.js`).

### Build & start

```bash
# All packages
bun run build
bun run start
```

```bash
cp ./apps/server/.env.example ./apps/server/.env
cp ./apps/web/.env.example ./apps/web/.env
```

---

## Quick start with Docker Compose

This repo ships a compose stack for development:

```bash
docker compose up -d
```

Services:

- `server` (Bun API) on 3030
- `web-ui` (Next.js) on 3040
- `postgres` with persistent volume and healthcheck
- Firecrawl API integration for web search and content extraction

The server runs `bun run db:migrate` on start and mounts hot‑reload volumes for development.

---

## API overview (Hono, base `/api/v1`)

All routes require auth cookies issued by better‑auth (`/api/auth/*` handled by server). Common 401 on missing session.

- `POST /search`

  - body: `{ input, model, provider, thread_id, space_ids?, file_ids? }`
  - returns: assistant `ThreadMessage`; creates title if needed and stores messages

- `GET /threads`
- `POST /threads` (create)
- `DELETE /threads/:id`
- `GET /threads/:id/messages`

- `GET /spaces`
- `POST /spaces` (name, icon?, description?)
- `GET /spaces/:id`
- `DELETE /spaces/:id`

- `GET /files/all` (current user)
- `GET /files/:space_id`
- `POST /files/:space_id/:id` (download)
- `DELETE /files/:space_id/:id`
- `POST /files/upload` (multipart: file, space_id)

- `POST /configs` → providers and supported file types

- `GET /user/settings` → stored API keys
- `POST /user/settings` → upsert provider key `{ provider, api_key?, url? }`
- `GET /user/keys`, `POST /user/keys` → same as settings (legacy)

---

## Contributing

We welcome issues, discussions, and PRs!

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md)
- See the [Contributing Guide](https://docs.curiositi.xyz/docs/contributing)
- Check the [Roadmap](https://docs.curiositi.xyz/docs/roadmap)

## License

Elastic V2 — see [`LICENSE.md`](./LICENSE.md).
