# Environment Variables Reference

All variables are defined per application. Required indicates local development necessity.

## Server (`apps/server`)
| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PORT` | Yes | API listen port (default 3030) |
| `NODE_ENV` | Yes | Environment mode (development/production) |
| `UI_HOST` | Yes | Origin of the web UI for CORS + redirects |
| `COOKIE_DOMAIN` | Dev optional | Domain for auth cookies (set for multi-subdomain) |
| `HOST` | Yes | Public base URL of server (used in links/emails) |
| `DATABASE_URL` | Yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret for session / token signing |
| `ENABLE_EMAIL_VERIFICATION` | Yes | Toggle email verification flow |
| `ENABLE_SIGNUP` | Yes | Gate public signups |
| `RESEND_API_KEY` | If verification | Resend email provider API key |
| `OPENROUTER_API_KEY` | Optional | OpenRouter LLM access |
| `OPENAI_API_KEY` | Optional | OpenAI model + embeddings |
| `OPENAI_EMBEDDING_MODEL` | Optional | Embedding model id (default: text-embedding-3-small) |
| `ANTHROPIC_API_KEY` | Optional | Anthropic models |
| `SEARXNG_URL` | Optional | Self-hosted meta search endpoint for web search |
| `SENTRY_DSN` | Optional | Error monitoring (server) |
| `BUN_VERSION` | Deploy | Pin Bun version in some platforms |
| `NODE_VERSION` | Deploy | Fallback node version for build layers |

## Web (`apps/web`)
| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_BASE_URL` | Yes | Public URL the Next.js app considers canonical |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Server base (used for API calls) |
| `SENTRY_AUTH_TOKEN` | Optional | Upload sourcemaps (build-time) |
| `SENTRY_DSN` | Optional | Client + edge error and perf instrumentation |

## Operational Notes
- Secrets should NOT be committed—`.env.example` documents shape only.
- For production, inject secrets via platform secret manager (Vercel / Render / Docker secrets / Kubernetes).
- Revocation strategy: rotate `BETTER_AUTH_SECRET` only during maintenance; sessions will invalidate.
- Embedding provider selection influences ingestion performance and cost.

## Adding New Variables
1. Add to runtime usage (server or web code).
2. Append to `.env.example` with placeholder and comment.
3. Update this document and any deployment instructions.
4. Validate with local startup (missing vars should throw early where possible).

## Security Guidance
- Never log full API keys; redact to last 4 chars.
- Default development values should be obviously non-production.
- Use separate keys per environment to aid revocation.
