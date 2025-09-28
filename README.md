<p align="center">
  <img src="./apps/web/src/assets/logo.svg" alt="Curiositi Logo" width="180" />
</p>

## Curiositi

An AI-powered knowledge workspace. Upload documents, organize them into spaces, and chat with an agent that searches your docs and the web. Built with Next.js, Bun, Hono, Drizzle ORM, and Turborepo.

### Monorepo layout

```
curiositi/
├─ apps/
│  ├─ web/            # Next.js 15 app router UI
│  └─ server/         # Bun + Hono API server
├─ packages/
│  └─ shared-types/   # Shared TS types
├─ docs/              # Docs & assets
└─ turbo.json         # Turborepo config
```

### Features

- Auth via better-auth with secure cross-subdomain cookies
- Spaces: create/delete spaces to group files
- File upload: PDF, Office, text; server extracts text and chunks it
- Vector search: OpenAI embeddings stored in Postgres `vector` via Drizzle
- Chat: agent composes answers using doc retrieval and web search
- Config API exposes enabled model providers and supported file types
- Sentry optional instrumentation

---

### Getting started

For detailed instructions, please visit our [Docs](https://docs.curiositi.xyz).

### Prerequisites

- Bun 1.x (recommended)
- PostgreSQL 16+ with `pgvector` extension

### Install

```bash
bun install
```

### Environment

Set these variables (dev defaults shown where present). The server refuses to start without `BETTER_AUTH_SECRET`.

- Server (`apps/server`)

  - `PORT` (default 3030)
  - `DATABASE_URL` (postgres connection string)
  - `BETTER_AUTH_SECRET` (required)
  - `UI_HOST` (default http://localhost:3040)
  - `SEARXNG_URL` (default http://localhost:8095)
  - `OPENROUTER_API_KEY` (optional)
  - `OPENAI_API_KEY` (optional; used for LLM and embeddings)
  - `OPENAI_EMBEDDING_MODEL` (default text-embedding-3-small)
  - `ANTHROPIC_API_KEY` (optional)
  - `SENTRY_DSN` (optional)

- Web (`apps/web`)
  - `SERVER_URL` (e.g. http://localhost:3030)
  - `BASE_URL` (e.g. http://localhost:3040)
  - `NEXT_PUBLIC_SERVER_URL` (same as above, exposed)
  - `NEXT_PUBLIC_BASE_URL` (same as above, exposed)
  - `SENTRY_AUTH_TOKEN` (optional)
  - `SENTRY_DSN` (optional)

### Database

Enable pgvector and run migrations:

```bash
# From repo root
bun run db:migrate
```

`apps/server/drizzle/0000_good_secret_warriors.sql` ensures `vector` extension exists.

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

## API overview (Hono, base `/api/v1`)

All routes require auth cookies issued by better-auth (`/api/auth/*` handled by server). Common 401 on missing session.

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

## Docker compose

This repo ships a compose stack for dev:

```bash
docker compose up -d
```

Services:

- `server` (Bun API) on 3030
- `web-ui` (Next.js) on 3040
- `postgres` with persistent volume and healthcheck
- `searxng` meta-search (optional web search) on 8095

The server runs `bun run db:migrate` on start. Mounts hot-reload volumes for development.

---

## Scripts

Root (turbo): `build`, `dev`, `lint`, `typecheck`, `format`, `db:generate`, `db:migrate`, `db:studio`

Server: `dev`, `start`, `db:generate`, `db:migrate`, `db:studio`

Web: `dev`, `build`, `start`, `lint`, `typecheck`, `preview`

---

## License

MIT. See `LICENSE.md`.
