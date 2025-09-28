# Frontend Architecture (Web)

A formal reference for the Next.js application located at `apps/web`.

## Structure
| Directory | Purpose |
| --------- | ------- |
| `app/` | Route segments, layouts, server components |
| `components/` | UI primitives, composite feature components (grouped) |
| `actions/` | Server actions for mutations (where used) |
| `services/` | API client wrappers and abstractions |
| `stores/` | Zustand state containers (chat, settings, threads) |
| `hooks/` | Reusable state/data hooks |
| `assets/` | Icons, images, static media |
| `styles/` | Global CSS and design tokens |
| `constants/` | App-level constant definitions |

## State Management
Zustand stores encapsulate client session state (e.g., active thread, chat messages). Keep stores minimal and domain-focused. Prefer ephemeral UI state inside components unless shared globally.

## Data Fetching
- TanStack Query for cached asynchronous data.
- Direct `fetch` or server actions for mutations that must run on the server edge/runtime.
- Use descriptive query keys (e.g., `['threads', threadId]`).

## Styling
Tailwind CSS v4 with optional `class-variance-authority` for variant patterns. Favor utility composition over deep custom CSS. When adding new design tokens, prefer Tailwind config extension rather than ad-hoc hex values.

## Authentication
Auth state derived from server session endpoints. Client requests rely on cookie session; avoid storing tokens in local storage.

## Error & Observability
Sentry integration available through `sentry.*.config.ts`. Wrap critical async boundaries with error boundaries or fallback UI where user impact is high.

## Adding a New Page
1. Create directory under `app/` with `page.tsx` (and layout if needed).
2. Fetch or prepare data via server component or client hook.
3. Reuse existing UI primitives from `components/ui`.
4. Add navigation entry if globally accessible.

## UI Component Guidelines
- Co-locate component-specific styles (or rely purely on Tailwind).
- Keep components pure; side effects in hooks or actions.
- Avoid deep prop drilling—lift shared state into a store or context when necessary.

## Theming & Dark Mode
If dark mode toggling exists on web, follow identical class strategy in docs site for consistency.

## Performance Considerations
- Use dynamic imports for rarely used heavy components.
- Memoize expensive child renders (React 19 concurrency will help but not replace profiling).
- Avoid oversubscribing to global stores (select slices).

## Testing (Future)
Adopt component testing strategy (e.g., Vitest + Testing Library) for critical logic; presently not implemented—document once added.
