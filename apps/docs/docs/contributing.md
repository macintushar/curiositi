---
id: contributing
title: Contributing Guide
description: How to contribute to Curiositi – development workflow, standards, and expectations.
---

Thanks for your interest in contributing! This guide helps you get productive quickly while maintaining quality and consistency.

## Development Workflow
1. **Fork & Clone** the repository.
2. **Install deps**: `bun install`
3. **Set environment** – copy the provided examples:
   ```bash
   cp ./apps/server/.env.example ./apps/server/.env
   cp ./apps/web/.env.example ./apps/web/.env
   ```
4. **Migrate DB** (Postgres + pgvector): `bun run db:migrate`
5. **Dev**: `bun run dev` (runs server + web concurrently).
6. Create a feature branch describing the change: `feat/search-ranking-tweak`.
7. Submit a PR referencing related issues.

## Project Structure (Monorepo)
- `apps/server` – Bun + Hono API (auth, ingestion, retrieval, agent)
- `apps/web` – Next.js app router UI
- `apps/docs` – Docusaurus documentation
- `packages/share` – Shared TypeScript types

## Code Style
- TypeScript strictness: keep types precise (avoid `any`).
- Prefer small pure functions; keep side effects isolated.
- Follow existing naming—do not mass-rename without reason.
- Run `bun run lint` & `bun run typecheck` before pushing.

## Git Standards
- Conventional-ish commit style (`feat:`, `fix:`, `docs:`, `refactor:` etc.).
- One logical change per PR; avoid bundling unrelated fixes.
- Reference issues with `Closes #123` when applicable.

## Testing & Validation
Currently lightweight; focus on:
- Retrieval / ingestion logic correctness
- Repro steps for bug fixes in PR description
- Manual sanity of UI flows (upload, search, chat)

## Security & Privacy
- Never commit secrets (env files are excluded by `.gitignore`).
- Use environment variables for provider keys.
- Report vulnerabilities privately first if sensitive.

## Documentation
If you add or change a feature impacting users—update or create a doc page and link it from the sidebar if needed.

## Issue Triage
Good first issues are labeled when available. Otherwise feel free to propose improvements (performance, DX, observability, etc.).

## Communication
Discussions / PR comments should stay constructive, clear, and respectful. See the Code of Conduct.

## Release & Deployment
Self-hosting oriented. CI ensures lint/build succeed. Docker images can be built via provided `Dockerfile`s.

## Need Help?
Open an issue with a minimal reproduction or question. PRs welcome—thank you for helping evolve Curiositi!
