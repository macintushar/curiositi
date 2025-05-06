# Getting Started with Curiositi 🧠

A high-performance Bun + Hono backend powering the Curiositi Retrieval-Augmented Generation (RAG) API. Curiositi Server orchestrates document ingestion, vector storage, web search, and LLM-based answer synthesis.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Running [Ollama](https://ollama.com/) instance
- Running [ChromaDB](https://www.trychroma.com/) instance
- Running [SearXNG](https://docs.searxng.org/) instance (using a public instance is not recommended as a lot of instances do not permit API usage)
- (Optional) PostgreSQL database for additional persistence

## Installation

```bash
# Clone the repository and navigate to the server folder
git clone https://github.com/macintushar/curiositi.git
cd curiositi/server

# Install dependencies with Bun
bun install
```

## Configuration

1. Copy and rename the environment example:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set the following variables:
   - `CHROMA_URL` (default: `http://localhost:8090`)
   - `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
   - `DATABASE_URL` (e.g., PostgreSQL connection string)
   - `OPENROUTER_API_KEY` (for OpenRouter)
   - `SEARXNG_URL` (web search API endpoint)

## Running the Server

- **Development (hot reload)**

  ```bash
  bun run dev
  ```

- **Production**
  ```bash
  bun run start
  ```

The API will be available at `http://localhost:3030` by default.
