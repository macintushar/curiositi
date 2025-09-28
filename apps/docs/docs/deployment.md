# Deployment & Build

Formal reference for building and deploying Curiositi components.

## Build Pipeline (Turbo)

Primary scripts (root `package.json`):

- `dev` → `turbo dev`
- `build` → `turbo build`
- `lint`, `typecheck`, `format` similarly fan out per project.

Each app declares its own build script:

- `apps/web`: Next.js production build (`next build`).
- `apps/server`: (If present) compile/start using Bun directly (no heavy bundling necessary).
- `apps/docs`: Docusaurus static site generation (`docusaurus build`).

## Recommended Production Steps

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build
```

Then deploy built artifacts per target.

## Environment Configuration

Provide environment variables at runtime (do not bake secrets into images). Validate critical vars early in application startup to fail fast.

## Docker

Example server image build:

```bash
docker build -t curiositi-server ./apps/server
```

Example web image build:

```bash
docker build -t curiositi-web ./apps/web
```

Run with explicit env injection:

```bash
docker run --rm -p 3030:3030 \
  -e DATABASE_URL=... \
  -e BETTER_AUTH_SECRET=... \
  curiositi-server
```

## Static Assets

- **Web:** Next.js outputs `.next/` build; serve via Node/Bun process or platform (Vercel, etc.).
- **Docs:** Output in `apps/docs/build` → deploy to any static host.

## Deployment Targets

| Target           | Notes                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| Vercel           | Excellent for `apps/web` + optionally `apps/docs` (static export)                                                     |
| Render / Railway | Suitable for Bun server & Postgres                                                                                    |
| Docker Compose   | Local integrated stack (DB + server + web)                                                                            |
| Kubernetes       | Scale server horizontally; ensure sticky session not required (session cookie approach stateless if storage external) |
| Self-Hosting     | Complete control over infrastructure; see [Self-Hosting Guide](self-hosting.md) for detailed setup                    |

## Scaling Considerations

- **Server:** Stateless; scale horizontally. Memory bound by concurrent embedding & request processing.
- **Vector Store:** If in-memory currently, migrate to durable backend for production scale.
- **Database:** Add connection pool (pgBouncer) if high concurrency.

## Observability

- Configure Sentry DSNs (server + web) for unified tracing.
- Add future metrics endpoint (Prometheus) for autoscaling signals.

## CI Suggestions (Not Included)

Pipeline stages:

1. Install + cache (Turbo remote cache optional)
2. Lint + Typecheck
3. Build server/web/docs
4. Run smoke tests (when added)
5. Publish images / deploy

## Zero-Downtime Strategy

- Use rolling deploy with readiness probes (K8s) or blue/green (Render).
- Keep schema migrations backward compatible; apply additive changes before code relying on them.

## Security Hardening

- Only expose necessary ports (3030 API, 3040 web).
- Set `NODE_ENV=production` and disable verbose logging in production.
- Rotate secrets (provider keys) regularly; avoid embedding them in images.

## Future Enhancements

- Introduce build artifact pruning to minimize image size.
- Add SBOM generation (CycloneDX) for compliance.
