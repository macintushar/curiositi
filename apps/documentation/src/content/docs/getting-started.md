---
title: Getting Started
description: Set up Curiositi locally for development and testing.
---

Welcome to Curiositi! This guide will help you get up and running with your own instance for development, testing, or self-hosting.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun 1.0.0+** - Primary runtime and package manager
- **Git** - For cloning the repository
- **PostgreSQL 16+** - Database with pgvector extension
- **Docker & Docker Compose** (optional) - For containerized development

You'll also need:
- **LLM Provider API Key** - At least one of: OpenAI, Anthropic, or OpenRouter
- **Firecrawl API Key** (optional) - For web search capabilities

## Quick Start with Docker

:::caution[Docker Compose Configuration Outdated]
The current `docker-compose.yml` file references outdated paths (`./server` and `./clients/web`) and uses `postgres:16-alpine` without pgvector. Manual setup is recommended until the Docker configuration is updated.
:::

## Manual Setup (Recommended)

### 1. Clone and Install

```bash
git clone https://github.com/macintushar/curiositi.git
cd curiositi
bun install
```

This installs all dependencies for the monorepo workspace, including:
- `apps/server` - Hono API server
- `apps/web` - Next.js 15 frontend  
- `apps/documentation` - Astro documentation site
- `packages/share` - Shared types and utilities

### 2. Set Up PostgreSQL with pgvector

Curiositi requires PostgreSQL 16+ with the pgvector extension for vector similarity search (1024-dimensional embeddings).

#### Option A: Using Docker

```bash
docker run -d \
  --name curiositi-postgres \
  -e POSTGRES_DB=curiositi \
  -e POSTGRES_USER=curiositi \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

#### Option B: Local PostgreSQL Installation

```bash
# Install PostgreSQL 16 and create database
createdb curiositi

# Install pgvector extension (varies by OS)
# On Ubuntu/Debian:
sudo apt install postgresql-16-pgvector

# On macOS with Homebrew:
brew install pgvector
```

#### Enable pgvector Extension

Connect to your database and enable the extension:

```sql
-- Using psql
psql -U curiositi -d curiositi

-- Run this SQL command
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 3. Configure Environment Variables

Copy the example environment files and customize them:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

#### Server Configuration (`apps/server/.env`)

Based on the actual `.env.example` file:

```env
# Server
SERVER_PORT=3030
UI_HOST=http://localhost:3040

# Database - PostgreSQL with pgvector
DATABASE_URL=postgresql://curiositi:your_secure_password@localhost:5432/curiositi

# Authentication (using better-auth)
BETTER_AUTH_SECRET=generate-a-long-random-secret-here
BETTER_AUTH_URL=http://localhost:3030
ENABLE_EMAIL_VERIFICATION=false  # Set true for production
ENABLE_SIGNUP=true

# Email (required if ENABLE_EMAIL_VERIFICATION=true)
# EMAIL_FROM=noreply@yourdomain.com
# RESEND_API_KEY=your-resend-api-key

# LLM Providers (at least one required)
OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-...

# Embeddings (required for vector search)
DEFAULT_EMBEDDING_PROVIDER=OPENAI  # or OLLAMA
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small  # OpenAI's 1024-dim model
# OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama

# Web Search (optional)
# FIRECRAWL_API_KEY=fc-...

# Optional: Error Tracking
# SENTRY_DSN=https://...@sentry.io/...
```

**Important Notes:**
- Generate `BETTER_AUTH_SECRET` with: `openssl rand -base64 32`
- Embedding models must output 1024-dimensional vectors (schema constraint)
- OpenAI's `text-embedding-3-small` is the default and recommended choice
- Ollama can be used for local embeddings (e.g., `nomic-embed-text`)

#### Web Configuration (`apps/web/.env`)

```env
# Public URLs (accessible from browser)
NEXT_PUBLIC_BASE_URL=http://localhost:3040
NEXT_PUBLIC_SERVER_URL=http://localhost:3030

# Optional: Error Tracking
# SENTRY_AUTH_TOKEN=your-sentry-token
```

### 4. Run Database Migrations

This creates all required tables and indexes:

```bash
bun run db:migrate
```

This executes migrations from `apps/server/drizzle/` using Drizzle ORM. Tables created:
- `user`, `session`, `account`, `verification` (auth)
- `space` (document collections)
- `file` (uploaded documents)
- `embedding` (vector embeddings with pgvector)
- `thread`, `message` (chat history)
- `search_history` (search logs)

### 5. Start Development Servers

#### Run All Services Concurrently:

```bash
bun run dev
```

This uses Turborepo to start:
- **API Server** at http://localhost:3030
- **Web UI** at http://localhost:3040
- **Documentation** at http://localhost:4321

#### Or Run Services Individually:

```bash
# Terminal 1: API Server
cd apps/server
bun run dev

# Terminal 2: Web UI  
cd apps/web
bun run dev

# Terminal 3: Documentation (optional)
cd apps/documentation
bun run dev
```

## First-Time Setup

### 1. Create an Account

1. Navigate to http://localhost:3040
2. Click **Sign Up**
3. Enter email and password
4. If `ENABLE_EMAIL_VERIFICATION=false`, you'll be logged in immediately
5. If email verification is enabled, check your email for the verification link

### 2. Create Your First Space

Spaces are collections of documents with isolated vector stores:

1. Click **Create Space** or the `+` icon
2. Choose a name (e.g., "Research Papers", "Documentation")
3. Optionally add a description and emoji icon
4. Click **Create**

### 3. Upload Documents

Supported formats: PDF, DOCX, PPTX, XLSX, ODT, ODP, ODS, TXT, CSV, MD

1. Open your space
2. Click **Upload Files** or drag-and-drop
3. Select one or more files
4. Wait for processing (parsing → chunking → embedding → storage)
5. Files appear in the sidebar once indexed

### 4. Start Chatting

1. Click **New Thread** to start a conversation
2. Type a question about your documents
3. The AI agent will:
   - Search relevant chunks using vector similarity
   - Optionally search the web (if Firecrawl configured)
   - Stream a response with citations
4. View sources by clicking referenced chunks

## Testing Your Installation

### Test Document Upload and Search

```bash
# 1. Upload a test PDF through the UI
# 2. Wait for "Indexed" status
# 3. Open a new thread
# 4. Ask: "What does this document discuss?"
```

The agent should retrieve relevant chunks and answer based on the document content.

### Test Web Search (if configured)

```bash
# In a new thread, ask a question requiring current information:
# "What's the latest news about AI?"
```

If Firecrawl is configured, the agent will search the web and cite sources.

### Test API Directly

All API routes are under `/api/v1/`. Authentication uses HTTP-only cookies from `better-auth`.

```bash
# Health check (no auth required)
curl http://localhost:3030/

# Get spaces (requires auth)
# First, log in via the web UI, then extract cookies from browser DevTools
curl -X GET http://localhost:3030/api/v1/spaces \
  -H "Cookie: better-auth.session_token=..."

# Create a thread
curl -X POST http://localhost:3030/api/v1/threads \
  -H "Cookie: better-auth.session_token=..." \
  -H "Content-Type: application/json" \
  -d '{"spaceId": "your-space-id", "title": "Test Thread"}'
```

See [API Reference](api/README.md) for full endpoint documentation.

## Development Workflow

### Code Quality Tools

```bash
# Lint all apps
bun run lint

# Format with Prettier
bun run format

# Type-check with TypeScript
bun run typecheck
```

### Database Management

```bash
# Generate new migration after schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Building for Production

```bash
# Build all apps
bun run build

# Build specific app
bun run build --filter @curiositi/server
bun run build --filter @curiositi/web
```

### Workspace Management

```bash
# Add dependency to root workspace
bun add <package> -w

# Add to specific app
bun add <package> --filter @curiositi/server
bun add <package> --filter @curiositi/web

# Remove dependency
bun remove <package> --filter @curiositi/server
```

## Troubleshooting

### Database Issues

**Error: relation "embedding" does not exist**
```bash
# Run migrations
bun run db:migrate
```

**Error: extension "vector" does not exist**
```bash
# Enable pgvector in PostgreSQL
psql -U curiositi -d curiositi -c "CREATE EXTENSION vector;"
```

**Error: connection refused**
- Verify PostgreSQL is running: `psql -U curiositi -d curiositi`
- Check `DATABASE_URL` in `apps/server/.env`
- Ensure port 5432 is not blocked

### Authentication Issues

**Can't log in / Session expired immediately**
- Verify `BETTER_AUTH_SECRET` is set (32+ characters)
- Check `BETTER_AUTH_URL` matches your server URL
- Clear browser cookies and try again
- Check browser console for CORS errors

**CORS errors in browser**
- Ensure `UI_HOST` in server `.env` matches your frontend URL
- Add frontend URL to `TRUSTED_ORIGINS` if configured

### File Upload Issues

**Upload fails silently**
- Check browser console for errors
- Verify file type is supported (see constants.ts)
- Check server logs for parsing errors

**Embeddings not generated**
- Verify `DEFAULT_EMBEDDING_PROVIDER` and API key are set
- Check embedding model outputs 1024 dimensions
- Review server logs for API errors

### Agent Not Responding

**Streaming doesn't start**
- Verify LLM provider API key is valid
- Check server logs for rate limits or API errors
- Test provider API directly with curl

**Agent returns empty responses**
- Check if documents are indexed (embeddings exist)
- Lower similarity threshold in search configuration
- Verify `DEFAULT_EMBEDDING_MODEL` matches indexed documents

### Performance Issues

**Slow vector search**
- Ensure pgvector indexes are created (check migrations)
- Consider adjusting similarity threshold (default: 0.3)
- Monitor database query performance with `EXPLAIN ANALYZE`

**High memory usage**
- Large PDFs consume significant memory during parsing
- Consider splitting large documents or increasing server RAM

## Getting Help

- **Documentation**: [https://docs.curiositi.dev](https://docs.curiositi.dev)
- **GitHub Issues**: [https://github.com/macintushar/curiositi/issues](https://github.com/macintushar/curiositi/issues)
- **Discussions**: [https://github.com/macintushar/curiositi/discussions](https://github.com/macintushar/curiositi/discussions)

## Next Steps

- **[Architecture Overview](architecture.md)** - Understand the system design
- **[API Reference](api/README.md)** - Explore available endpoints
- **[LLM Agent Guide](llm-agent.md)** - Learn how the AI agent works
- **[Self-Hosting](self-hosting.md)** - Deploy to production
- **[Contributing](contributing.md)** - Help improve Curiositi
