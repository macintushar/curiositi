# Curiositi 🧠

Curiositi is an AI assistant that unifies semantic search across personal documents and the live web. It leverages LangChain.js, Chroma, SearXNG, and Ollama for hybrid Retrieval-Augmented Generation (RAG), orchestrated via a high-performance Bun+Hono TypeScript API with a React-based UI.

## How it Works

1. **User Query**: Users submit queries through the UI.
2. **Document Search**: The server first searches indexed local documents using Chroma for vector search.
3. **Relevance Check**: It checks if the documents are relevant to the query.
4. **Web Search**: If documents aren't relevant, a web search is performed using SearXNG.
5. **Answer Generation**: An LLM synthesizes information from documents or web results to generate an answer.
6. **Response**: The answer is streamed back to the user in the UI.

![Flow Image](./docs/curiositi-flow.png)

## Technology Stack

- **Backend**: [Bun](https://bun.sh/) + [Hono](https://hono.dev/)
- **Agent Logic**: [LangChain.js](https://js.langchain.com/docs/get_started/introduction)
- **Document Store**: [Chroma](https://www.trychroma.com/)
- **Web Search**: [SearXNG](https://docs.searxng.org/)
- **Embeddings/LLM**: [Ollama](https://ollama.com/)
- **Frontend**: React-based UI

## Features

- **Hybrid RAG**: Combines Chroma vector search and SearXNG web search.
- **PDF/TXT Ingestion**: Upload, chunk, and embed documents.
- **Streaming API**: `/chat` endpoint streams responses.
- **Extensible Tools**: Modular agent tools for integration and expansion.

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/macintushar/curiositi.git
cd curiositi/server
bun install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration details.

### 3. Run the Server

```bash
bun run dev
# or for production
bun run start
```

API will be available at `http://localhost:3030`.

## API Endpoints

- **`/upload`**: Upload PDF/TXT, chunk, embed, and store in Chroma.
- **`/chat`**: Hybrid RAG chat, streams response.

## Roadmap

### v1: Core Features

- **Hybrid Retrieval-Augmented Generation (RAG)**
  - [x] Document Search using Chroma vector search.
  - [x] Web Search using SearXNG.
  - [x] Query processing with LangChain.js.
  - [x] PDF/TXT ingestion and embedding via Ollama.
  - [x] Streaming API for chat responses.
  - [x] Basic React UI for user interaction.
  - [x] Bun+Hono backend setup.

### v2: Enhanced Integration

- **Integrations**
  - [ ] Notion MCP connector for fetching pages and databases.
  - [ ] Google Drive API connector for folder/file selection.
- **Hybrid Retrieval**
  - [ ] Combine semantic and keyword retrieval.
- **Analytics**
  - [ ] Basic analytics dashboard for user interactions.

### v3: Market Readiness

- **Advanced Features**
  - [ ] Multi-LLM support for diverse query handling.
  - [ ] Plugin system for extensibility.
  - [ ] Role-Based Access Control (RBAC) for enterprise use.
  - [ ] Billing system for monetization.
  - [ ] SLA 99.9% uptime for reliability.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.

© 2025 Curiositi Team
