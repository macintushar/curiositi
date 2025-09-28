# Getting Started

A formal setup guide for developers and OSS contributors.

## 1. Prerequisites
- Bun >= 1.0 (monorepo scripts & server runtime)
- Node.js >= 20 (tooling compatibility if needed)
- Git, Docker (optional for DB), Postgres instance
- (Optional) Sentry account, LLM provider keys (OpenAI, Anthropic, OpenRouter)

## 2. Clone & Install
```bash
git clone <your-fork-or-origin> curiositi
cd curiositi
bun install
```
Turbo + Bun will hoist and link workspace dependencies.

## 3. Directory Structure (Essentials)
```
apps/
  web/      → Next.js front-end (port 3040)
  server/   → Hono API + ingestion (port 3030)
  docs/     → Docusaurus documentation
packages/
  share/    → Shared types/utilities
```

## 4. Environment Variables
Copy examples and fill required values.
```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```
Minimum to start locally (server):
```
PORT=3030
HOST=http://localhost:3030
DATABASE_URL=postgres://user:pass@localhost:5432/curiositi
BETTER_AUTH_SECRET=replace_with_random_string
ENABLE_EMAIL_VERIFICATION=false
ENABLE_SIGNUP=true
```
Frontend minimal:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3040
NEXT_PUBLIC_SERVER_URL=http://localhost:3030
```
Add provider keys when testing embeddings / model inference.

## 5. Database Setup
Ensure Postgres is running and database exists:
```bash
createdb curiositi
```
Run migrations (Drizzle snapshots already present):
```bash
# If a migration script exists; otherwise Drizzle introspection may be added later
# Placeholder: confirm migration workflow (not shown in repo root scripts)
```
(If a migration command is later added via Turbo, update this section.)

## 6. Run Applications
In separate terminals:
```bash
bun run dev --filter @curiositi/server
bun run dev --filter @curiositi/web
bun run dev --filter @curiositi/docs  # optional
```
Or run all concurrently:
```bash
bun run dev
```
(Depends on `turbo.json` pipeline configuration.)

## 7. Authentication Flow
The server enforces authenticated access for `/api/v1/*`. The bundled auth library issues session cookies—ensure `UI_HOST` and `COOKIE_DOMAIN` align to permit cross-site cookies during development.

## 8. Upload & Ingestion Flow (Quick Test)
1. Create a space via API or UI.
2. Upload a supported file (PDF, Office, plain text).
3. Backend extracts text → splits → generates embeddings → inserts into vector store.
4. Perform a search request with filters.

## 9. API Testing
Use an HTTP client (e.g., Bruno, Postman) with an authenticated cookie session from the web login.
Example (Threads):
```http
GET http://localhost:3030/api/v1/threads
Cookie: <session cookies>
```
Search:
```http
POST http://localhost:3030/api/v1/search
Content-Type: application/json
Cookie: <session>
{
  "input": "vector architecture",
  "model": "openai:gpt-4o-mini",
  "space_ids": [],
  "file_ids": [],
  "provider": "openai",
  "thread_id": null
}
```

## 10. Tailwind / UI Conventions
Frontend uses Tailwind v4 with co-located UI components under `components/ui`. Prefer composable primitives + variant utilities (e.g., `class-variance-authority`) when adding new UI.

## 11. Adding Dependencies
Use workspace-aware install:
```bash
bun add <pkg> -w                     # root
bun add <pkg> --filter @curiositi/web # scoped
```

## 12. Linting, Formatting, Types
```bash
bun run lint
bun run format
bun run typecheck
```
(These proxy to Turbo pipelines.)

## 13. Production Build
```bash
bun run build --filter @curiositi/server
bun run build --filter @curiositi/web
```
Serve:
```bash
bun run start --filter @curiositi/server
bun run start --filter @curiositi/web
```

## 14. Docker (Outline)
Each app has a `Dockerfile`. Use `docker-compose.yml` (if extended later) or build individually.
```
docker build -t curiositi-server ./apps/server
```

## 15. Next Steps
- Review [Environment Reference](env.md)
- Understand [Architecture](architecture.md)
- Explore [API Reference](api/README.md)
