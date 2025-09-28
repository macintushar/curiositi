---
id: search
title: Search & Retrieval
description: How Curiositi indexes content and retrieves relevant context for RAG answers.
---

Curiositi blends **vector similarity**, lightweight metadata filtering, and optional **web search** to supply grounded context to the LLM.

## Pipeline Overview
1. **Ingestion** – Files are uploaded, text is extracted (PDF/Office/plain), chunked, and embedded.
2. **Storage** – Chunks + embeddings persisted in Postgres using the `vector` type (pgvector extension).
3. **Query** – A user message triggers: embedding of the query -> vector similarity search -> optional keyword / metadata refinement.
4. **Web Augmentation (Optional)** – If enabled, a SearXNG meta-search fetches fresh snippets which are normalized and scored.
5. **Context Assembly** – Top document chunks + (optional) web results are merged, deduplicated, and truncated to model token budget.
6. **Generation** – An LLM produces the final answer citing which sources were used when possible.

## Spaces & Scoping
- **Spaces** group related files (projects, teams, subjects).
- A query can be restricted to one or more space IDs (or specific file IDs) to narrow retrieval.
- This minimizes noise and improves precision.

## Embeddings
Default embedding model is configurable via environment (`OPENAI_EMBEDDING_MODEL`). You can switch providers (OpenAI / OpenRouter / others) without re-writing the pipeline—new embeddings are generated on subsequent ingestion.

## Chunking Strategy
- Fixed-size text windows with slight overlap balance recall + cost.
- Overlap ensures semantic continuity across paragraph boundaries.
- Very large files are streamed during extraction to avoid memory spikes.

## Ranking & Deduplication
After similarity scoring:
- Near-duplicate chunks (high cosine similarity + overlapping source span) are pruned.
- Web snippets are interleaved using a simple score normalization so that very relevant fresh data can appear among top internal chunks.

## Citing Sources
Chunks retain file + space metadata allowing the UI / agent to display "Sources" beneath answers (e.g. document titles + web domain list).

## Configuration Reference
See also:
- [Ingestion](/docs/ingestion) – extraction & chunking internals
- [LLM Agent](/docs/llm-agent) – orchestration + prompt assembly
- [Environment](/docs/env) – provider keys & model controls

## Future Improvements (Roadmap)
- Hybrid BM25 + vector re-ranking
- Cross-file semantic clustering for diversification
- Streaming partial context reasoning traces

If you have ideas, open a discussion or PR in **GitHub**.
