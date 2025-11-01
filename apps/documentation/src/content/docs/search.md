---
id: search
title: Search & Retrieval
description: How Curiositi indexes content and retrieves relevant context for RAG answers.
---

Curiositi blends vector similarity, lightweight metadata filtering, and optional web search to supply grounded context to the LLM.

## Endpoints overview

- POST /api/v1/search – synchronous, returns a JSON response and persists messages
- POST /api/v1/search/stream – streaming, returns a plain text stream and persists history after completion

Authentication: both routes require a valid session cookie.

## Request schema

Both routes accept the same JSON body (validated by the server):

{
  "input": "Your question...",                  // required, string
  "model": "gpt-4o-mini",                      // required, string
  "provider": "openai",                        // required, one of: openai | anthropic | openrouter
  "thread_id": "uuid",                         // required, string
  "space_ids": ["space-uuid", "..."] ,        // optional, string[]
  "file_ids": ["file-uuid", "..."]            // optional, string[] (ignored by the stream route currently)
}

Optional headers
- X-User-Timezone: e.g., America/New_York. Used to improve prompt context.

Notes
- In the current implementation, /api/v1/search/stream does not use file_ids even if provided. Restrict by spaces to scope retrieval.
- The streaming route returns a plain text stream (chunked text) without SSE/event envelopes.

## Typical pipeline

1) Ingestion – Files are uploaded, text is extracted (PDF/Office/plain), chunked, and embedded.
2) Storage – Chunks + embeddings are stored in Postgres (pgvector).
3) Retrieval – The query is embedded and matched via vector similarity, optionally scoped by spaces.
4) Web augmentation (optional) – If enabled and applicable, Firecrawl search fetches fresh web content which is normalized and scored.
5) Context assembly – Top document chunks + optional web results are merged, deduplicated, and trimmed to the model budget.
6) Generation – The LLM produces an answer. The agent persists the user and assistant messages to the thread. Parsed tool results are saved post-stream.

## Examples

Synchronous

curl -sS -X POST "$SERVER/api/v1/search" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -H "X-User-Timezone: America/Los_Angeles" \
  -d '{
    "input": "Summarize the Q3 plan",
    "model": "gpt-4o-mini",
    "provider": "openai",
    "thread_id": "THREAD_UUID",
    "space_ids": ["SPACE_UUID"]
  }'

Streaming (plain text)

curl -sS -N -X POST "$SERVER/api/v1/search/stream" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -H "X-User-Timezone: America/New_York" \
  -d '{
    "input": "Explain vector search",
    "model": "gpt-4o-mini",
    "provider": "openai",
    "thread_id": "THREAD_UUID",
    "space_ids": ["SPACE_UUID"]
  }' \
  | sed -u -e 's/.*/[chunk] &/'

Client guidance
- Treat the streaming response as a continuous text body and append chunks as they arrive.
- Do not assume SSE framing; no event names or JSON envelopes are guaranteed.

## Spaces and scoping

- Spaces group related files (projects, teams, subjects).
- Restricting a query to one or more space IDs narrows retrieval and improves precision.

## Embeddings

- Embeddings are 1024-dimensional vectors stored via pgvector.
- The default embedding model can be overridden using OPENAI_EMBEDDING_MODEL.

## Chunking and ranking

- Fixed-size windows with overlap preserve coherence across boundaries.
- After similarity scoring, near-duplicate chunks are pruned.
- Web snippets (when used) are interleaved via simple score normalization.

## Citing sources

Chunks retain file and space metadata, allowing the UI/agent to display Sources beneath answers. Web results are parsed and saved after the stream when available.

See also
- Ingestion – extraction and chunking internals
- LLM Agent – orchestration and tool behavior
- Environment – provider keys and model controls
