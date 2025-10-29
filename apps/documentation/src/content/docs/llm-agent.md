---
title: LLM & Agent Layer
description: This document summarizes model/provider abstraction and agent behaviors.
---

This document summarizes model/provider abstraction and agent behaviors.

## Goals

- Provide pluggable multi-provider model invocation.
- Offer consistent interfaces for chat completion and embeddings.
- Allow per-user API key configuration.

## Components

| Component                   | Responsibility                                      |
| --------------------------- | --------------------------------------------------- |
| `models-list.ts`            | Declares available models and providers             |
| `lib/llms.ts`               | Provider client wrappers / selection logic          |
| `agents/curiositi-agent.ts` | High-level orchestration (conversation + retrieval) |
| `services/search.ts`        | Integrates retrieval + generation pipeline          |

## Provider Configuration

User submits API keys via `/api/v1/user/settings` or `/api/v1/user/keys`. Keys stored and injected at request time (session context associates user ID → provider creds).

## Model Selection

API request fields (`model`, `provider`) inform which underlying client executes the prompt. Embedding model may differ from generation model; currently configured via env and constants.

## Retrieval-Augmented Flow (High-Level)

1. Receive search/chat input.
2. Retrieve vectors (similar chunks) for context.
3. Construct prompt (system + user + context assembly).
4. Send to chosen provider.
5. Return structured response with model output and references.

## Adding a Provider

1. Implement minimal client in `lib/llms.ts` (auth headers, endpoint path, error normalization).
2. Append provider + models to `models-list.ts` (include capability flags if needed: streaming, tool use, etc.).
3. Expose provider in user settings UI (web app) and accept API key.
4. Update documentation (this file + API reference if new routes added).

## Error Handling Patterns

- Normalize provider-specific errors into a unified shape (suggested improvement if not present).
- Distinguish transient (retryable) vs fatal errors.

## Potential Enhancements

- Streaming support for partial responses.
- Tool invocation / function calling.
- Caching of recent model responses.
- Per-model token usage metrics.

## Security Considerations

- Never persist raw prompts containing sensitive user data beyond immediate processing (unless audit logging is formalized with consent).
- Rate limit model requests per user to avoid key abuse.
