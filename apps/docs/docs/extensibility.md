# Extensibility Recipes

Formal guidance for extending Curiositi's core domains.

## Add a New API Route
1. Create `apps/server/src/routes/<name>.ts` exporting a Hono router.
2. Define schemas using Zod (`types/schemas.ts`).
3. Implement service functions in `services/<domain>.ts`.
4. Mount in `api.ts`: `apiRouter.route('/<name>', <name>Router)`.
5. Update API docs and add tests (future).

## Add a Model Provider
1. Implement provider adapter in `lib/llms.ts` (auth, endpoint, transform response).
2. Register in `models-list.ts` with stable identifier (`provider:model-id`).
3. Expose provider option in UI (settings form + validation).
4. Update `llm-agent.md` documentation.

## Add an Ingestion File Type
1. Add MIME constant to supported list.
2. Implement extraction branch in `ingestion.ts` (fallback: treat as text if UTF-8 safe).
3. Consider large-file streaming (future enhancement) if > limit.

## Add a Vector Backend
1. Create abstraction layer function (if not already): `vectorStore.ts` methods.
2. Implement new backend module (e.g., PgVector / external API).
3. Toggle backend via env var or config map.

## Add Frontend Feature Module
1. Create domain folder under `components/<domain>`.
2. Add state slice (Zustand) only if cross-component sharing required.
3. Add API wrapper in `services/` matching backend route.
4. Integrate into navigation/layout.

## Add Shared Types
1. Place types in `packages/share/types.ts` or domain file.
2. Reference via workspace alias (`@curiositi/share`).
3. Avoid importing server-only types into frontend if they include sensitive shapes.

## Introduce Background Processing
(Planned) Use a job queue abstraction inside server (BullMQ / custom) for long-running ingestion tasks. Document queue name, retry policy.

## Implement Rate Limiting
1. Choose store (Redis recommended).
2. Create middleware applying per-user or IP sliding window.
3. Apply to `apiRouter.use('*', limiterMiddleware)` before route mounts.

## Observability Extension
1. Add structured logging (pino) with correlation IDs.
2. Emit metrics (Prometheus format) from key service steps.

## Security Checklist for New Features
- Input validated (Zod schema) at boundary.
- Auth enforced (reject unauthenticated & unauthorized users).
- Errors sanitized (no stack leakage in production).
- No secrets logged.
