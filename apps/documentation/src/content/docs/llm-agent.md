---
 title: LLM & Agent Layer
 description: This document summarizes model/provider abstraction and agent behaviors.
---

This document summarizes model/provider abstraction and agent behaviors. It reflects the current SearchAgent implementation and streaming behavior in the server.

## Goals

- Provide pluggable multi-provider model invocation.
- Offer consistent interfaces for chat completion and embeddings.
- Allow per-user API key configuration.

## Components

| Component                   | Responsibility                                      |
| --------------------------- | --------------------------------------------------- |
| `models-list.ts`            | Declares available models and providers             |
| `lib/llms.ts`               | Provider client wrappers / selection logic          |
| `agents/search-agent.ts`    | Current streaming agent with tool calling           |
| `services/search.ts`        | Integrates retrieval + generation pipeline          |

## Provider Configuration

User submits API keys via `/api/v1/user/settings` or `/api/v1/user/keys`. Keys stored and injected at request time (session context associates user ID → provider creds).

## Model Selection

API request fields (`model`, `provider`) inform which underlying client executes the prompt. Embedding model may differ from generation model; currently configured via env and constants.

## Retrieval-Augmented Flow (High-Level)

1. Receive search/chat input.
2. Retrieve vectors (similar chunks) for context and optionally run web search.
3. Construct prompt (system + user + context assembly + space metadata and X-User-Timezone).
4. Stream generation begins immediately; tools may be called mid-stream.
5. After the stream completes, messages and parsed sources are persisted to the thread.

## Adding a Provider

1. Implement minimal client in `lib/llms.ts` (auth headers, endpoint path, error normalization).
2. Append provider + models to `models-list.ts` (include capability flags if needed: streaming, tool use, etc.).
3. Expose provider in user settings UI (web app) and accept API key.
4. Update documentation (this file + API reference if new routes added).

## Error Handling Patterns

- Normalize provider-specific errors into a unified shape (suggested improvement if not present).
- Distinguish transient (retryable) vs fatal errors.

## Current Streaming Behavior

- The streaming route returns a plain text stream (not SSE). Clients should read it as a continuous text body.
- The SearchAgent exposes tools named `search_documents` and `search_web`.
- Tool output is expected to be JSON with shape: { "summary": string, "results": [{ "title": string, "content": string, "source": string, "query"?: string }] }.
- The agent system prompt enforces inline citations like [1], [2] and a References section with full URLs.
- The server saves the final assistant text, toolCalls, toolResults, and parsed sources to the messages table after streaming.

## Potential Enhancements

- SSE or JSON-chunk streaming with events (if needed by clients).
- More robust tool result parsing with versioned schema.
- Caching of recent model responses.
- Per-model token usage metrics.

## Security Considerations

- Never persist raw prompts containing sensitive user data beyond immediate processing (unless audit logging is formalized with consent).
- Rate limit model requests per user to avoid key abuse.
