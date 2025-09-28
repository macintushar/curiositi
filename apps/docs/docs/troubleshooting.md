# Troubleshooting & FAQ

Formal reference for common issues.

## Server Returns 401 For All API Routes

- Ensure browser has session cookies (login via web app first).
- Confirm `UI_HOST` matches frontend origin exactly (protocol + port).
- Check clock skew (token/session issuance may be time-sensitive).

## File Upload Succeeds but Search Yields No Results

- Unsupported MIME: verify file type appears in allowed list.
- Empty text extraction: check server logs for `No text extracted` warning.
- Embedding provider key missing or invalid.

## Embedding/Model Errors

- Confirm provider API key stored via settings endpoints.
- Verify model identifier matches `models-list.ts` entries.
- Network egress blocked by local firewall / corporate proxy.

## Styles Not Applying in Docs

- Tailwind layers must be at top of `custom.css`.
- Restart dev server after adding new content paths to `tailwind.config.ts`.

## Session Not Persisting

- Ensure `COOKIE_DOMAIN` is omitted or matches domain correctly in local dev.
- Clear cookies and retry login.

## Port Conflicts

- Change `PORT` (server) or Next.js dev port with `--port` flag.

## Database Connection Failures

- Validate `DATABASE_URL` credentials individually with `psql`.
- Check that Postgres is listening on expected interface (localhost vs container network).

## Slow Ingestion

- Large PDFs: consider splitting externally until streaming introduced.
- Network latency to embedding provider—test with smaller file to isolate.

## Adding a New Env Var Has No Effect

- Restart processes; Bun does not reload env automatically.
- Confirm not shadowed by platform-injected secret in deployment.

## Build Failures

- Run `bun run typecheck` to surface TS errors early.
- Delete lockfile + reinstall if dependency metadata corrupted.

## Where to Ask Questions

- Open an issue (feature / bug template) in the repository.
