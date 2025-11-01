---
title: Architecture
description: Deep dive into Curiositi's system architecture, data flows, and technical design.
---

This document provides a comprehensive overview of Curiositi's architecture based on the actual codebase implementation.

## System Overview

Curiositi is built as a Turborepo monorepo with three main applications:

- **Web App** (`apps/web`): Next.js 15 frontend with React 19
- **API Server** (`apps/server`): Hono backend running on Bun runtime
- **Documentation** (`apps/documentation`): Astro with Starlight theme
- **Shared Packages** (`packages/share`): Shared TypeScript types and utilities

**Tech Stack:**
- **Runtime**: Bun (server) + Node.js (web build)
- **Package Manager**: Bun workspaces
- **Monorepo**: Turborepo for build orchestration
- **Database**: PostgreSQL 16+ with pgvector extension
- **ORM**: Drizzle ORM with Zod validation

## High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Web Client    │         │   API Server    │         │   PostgreSQL    │
│   (Next.js 15)  │◄───────►│  (Hono + Bun)   │◄───────►│  16 + pgvector  │
│                 │  HTTP   │                 │   ORM   │                 │
│ • React 19 UI   │         │ • better-auth   │         │ • user, session │
│ • TanStack Query│         │ • File ingestion│         │ • space, file   │
│ • Zustand store │         │ • SearchAgent   │         │ • embedding     │
│ • SSR + Client  │         │ • Vector search │         │ • message       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │                           ▼                           ▼
         │                  ┌─────────────────┐        ┌─────────────────┐
         │                  │  LLM Providers  │        │  Vector Search  │
         │                  │                 │        │                 │
         └─────────────────►│ • OpenAI        │        │ • 1024-dim      │
           (optional)       │ • Anthropic     │        │ • Cosine dist   │
                            │ • OpenRouter    │        │ • Threshold 0.3 │
                            │ • Ollama (local)│        └─────────────────┘
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Firecrawl     │
                            │  (Web Search)   │
                            │   - Optional    │
                            └─────────────────┘
```

**Data Flow:**
1. User interacts with Next.js frontend
2. Frontend calls Hono API via HTTP (`/api/v1/*`)
3. Auth middleware validates `better-auth` session cookie
4. Business logic executes (file processing, search, etc.)
5. Drizzle ORM queries PostgreSQL with pgvector
6. SearchAgent streams responses with tool calls (document search, web search)
7. Results stream back to the frontend as a plain text stream (non-SSE)

## Core Components

### Web Application (`apps/web`)

**Technology Stack:**
- **Framework**: Next.js 15.1.6 with App Router
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Data Fetching**: TanStack Query v5 (server state)
- **State Management**: Zustand (client state)
- **Auth**: better-auth client with React hooks
- **Forms**: React Hook Form + Zod validation
- **Build**: Turbopack (development), Webpack (production)

**Directory Structure:**
```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── app/                # Protected app routes
│   │   ├── chat/           # Chat interface
│   │   ├── settings/       # User settings
│   │   └── layout.tsx      # App layout with sidebar
│   ├── (auth)/             # Auth route group
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── app/                # App-specific components
│   ├── ui/                 # shadcn/ui components
│   └── themes/             # Theme providers
├── actions/                # Next.js Server Actions
├── services/               # API client functions
├── stores/                 # Zustand stores
├── hooks/                  # Custom React hooks
└── lib/                    # Utilities and configs
```

**Key Features:**
- **Server Components**: Initial renders for performance + SEO
- **Client Components**: Interactive chat, file uploads, real-time updates
- **Server Actions**: Form submissions (create space, update settings)
- **Streaming**: Plain text streaming (non-SSE)
- **Optimistic Updates**: Instant UI feedback with TanStack Query

**Authentication Flow:**
```typescript
// Uses better-auth React client
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword"
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com", 
  password: "securepassword"
});

// Session automatically stored in HTTP-only cookie
```

### API Server (`apps/server`)

**Technology Stack:**
- **Framework**: Hono 4.x (lightweight web framework)
- **Runtime**: Bun (fast JavaScript runtime)
- **ORM**: Drizzle ORM with PostgreSQL driver
- **Validation**: Zod schemas
- **Auth**: better-auth with session cookies
- **AI Framework**: LangChain + Vercel AI SDK
- **OpenAPI**: @hono/zod-openapi for API documentation

**Entry Point** (`apps/server/src/index.ts`):
```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import apiRouter from "@/routes/api";

const app = new OpenAPIHono();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: TRUSTED_ORIGINS,
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"]
}));

// Routes
app.get("/", (c) => /* Landing page HTML */);
app.get("/health", (c) => c.json({ status: "ok" }));
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/v1", apiRouter);

// OpenAPI documentation
app.doc("/doc", { openapi: "3.0.0", info: { title: "Curiositi API" } });
```

**Routing Architecture** (`apps/server/src/routes/api.ts`):
```typescript
const apiRouter = new Hono();

// Global auth middleware - all /api/v1/* routes require authentication
apiRouter.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// Mount sub-routers
apiRouter.route("/threads", threadsRouter);    // Chat threads
apiRouter.route("/search", searchRouter);      // Search + agent
apiRouter.route("/spaces", spacesRouter);      // Space CRUD
apiRouter.route("/files", filesRouter);        // File upload/manage
apiRouter.route("/user", userRouter);          // User settings
apiRouter.route("/configs", configsRouter);    // API key configs
```

**Service Layer**:
- `services/threads.ts` - Thread and message CRUD
- `services/spaces.ts` - Space management
- `services/files.ts` - File metadata operations
- `services/ingestion.ts` - Document processing pipeline
- `services/queries.ts` - Vector similarity search
- `services/search.ts` - Unified search interface

**Agent Layer**:
- `agents/search-agent.ts` - **Current agent** (streaming, tool calling)
- `agents/curiositi-agent.ts` - Legacy implementation (kept for reference)

### Database Layer (PostgreSQL + pgvector)

**Schema** (`apps/server/src/db/schema.ts`):

```typescript
// Authentication tables (better-auth)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent")
});

// Core application tables
export const space = pgTable("space", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // Emoji or icon identifier
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const file = pgTable("file", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  spaceId: text("space_id").notNull().references(() => space.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  path: text("path").notNull(), // file system path
  status: text("status").default("pending"), // pending, processing, indexed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Vector embeddings (1024 dimensions required)
export const embedding = pgTable("embedding", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: text("file_id").notNull().references(() => file.id, { onDelete: "cascade" }),
  spaceId: text("space_id").notNull().references(() => space.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // Original text chunk
  vector: vector("vector", { dimensions: 1024 }).notNull(), // pgvector type
  metadata: jsonb("metadata"), // Additional chunk metadata
  createdAt: timestamp("created_at").defaultNow()
});

// Chat functionality
export const thread = pgTable("thread", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  spaceId: text("space_id").notNull().references(() => space.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const message = pgTable("message", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  threadId: text("thread_id").notNull().references(() => thread.id, { onDelete: "cascade" }),
  sources: jsonb("sources"), // Search result citations
  provider: text("provider"), // openai, anthropic, etc.
  model: text("model"), // gpt-4, claude-3, etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Search history tracking
export const searchHistory = pgTable("search_history", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  spaceId: text("space_id").references(() => space.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow()
});
```

**Indexes**:
```sql
-- Vector similarity index (HNSW algorithm for fast ANN search)
CREATE INDEX embedding_vector_idx ON embedding USING hnsw (vector vector_cosine_ops);

-- Foreign key and query optimization indexes
CREATE INDEX embedding_file_id_idx ON embedding (file_id);
CREATE INDEX embedding_space_id_idx ON embedding (space_id);
CREATE INDEX file_space_id_idx ON file (space_id);
CREATE INDEX thread_space_id_idx ON thread (space_id);
CREATE INDEX message_thread_id_idx ON message (thread_id);
```

**Vector Search Query**:
```typescript
// From services/queries.ts
const results = await db
  .select({
    id: embedding.id,
    content: embedding.content,
    fileName: file.name,
    distance: sql<number>`1 - (${embedding.vector} <=> ${queryVector})`
  })
  .from(embedding)
  .innerJoin(file, eq(embedding.fileId, file.id))
  .where(
    and(
      eq(embedding.spaceId, spaceId),
      sql`1 - (${embedding.vector} <=> ${queryVector}) > 0.3` // 0.3 similarity threshold
    )
  )
  .orderBy(sql`${embedding.vector} <=> ${queryVector}`)
  .limit(10);
```

## Data Flow Patterns

### Document Ingestion Flow

The ingestion pipeline processes uploaded files and stores vectorized chunks for retrieval.

**Step-by-Step Process:**

```
1. Upload → 2. Validate → 3. Parse → 4. Chunk → 5. Embed → 6. Store
```

**Detailed Implementation** (`services/ingestion.ts`):

```typescript
// 1. File Upload (POST /api/v1/files/upload)
export async function uploadFile(formData: FormData, spaceId: string, userId: string) {
  const file = formData.get("file") as File;
  
  // 2. Validate file type
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", "text/csv", "text/markdown"
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }
  
  // Store file metadata in database
  const fileRecord = await db.insert(file).values({
    name: file.name,
    spaceId,
    userId,
    mimeType: file.type,
    size: file.size,
    path: `/uploads/${spaceId}/${file.name}`,
    status: "processing"
  }).returning();
  
  // 3. Extract text content (based on mime type)
  const textContent = await extractText(file);
  
  // 4. Split into chunks (RecursiveCharacterTextSplitter)
  const chunks = await splitIntoChunks(textContent, {
    chunkSize: 1000,      // characters
    chunkOverlap: 200     // overlap for context
  });
  
  // 5. Generate embeddings for each chunk
  const embeddings = await generateEmbeddings(chunks); // Calls OpenAI/Ollama API
  
  // 6. Store chunks with vectors in pgvector
  await db.insert(embedding).values(
    chunks.map((chunk, i) => ({
      fileId: fileRecord.id,
      spaceId,
      content: chunk.text,
      vector: embeddings[i],  // 1024-dimensional vector
      metadata: { page: chunk.metadata.page, index: i }
    }))
  );
  
  // Update file status
  await db.update(file)
    .set({ status: "indexed" })
    .where(eq(file.id, fileRecord.id));
}
```

**Text Extraction Tools:**
- PDF: `pdf-parse` library
- Office formats: `mammoth` (docx), `pptxgenjs` (pptx), `xlsx` library
- Plain text: Direct reading

**Chunking Strategy:**
- Uses LangChain's `RecursiveCharacterTextSplitter`
- Default: 1000 characters per chunk, 200 character overlap
- Preserves sentence boundaries when possible

### Search Agent Flow

The SearchAgent handles user queries with streaming responses and dynamic tool calling.

**Agent Architecture** (`agents/search-agent.ts`):

```typescript
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function searchAgent(query: string, spaceId: string, threadId: string) {
  // Initialize LLM provider
  const provider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Define available tools
  const tools = {
    // Vector search in user's documents
    docSearch: tool({
      description: "Search through uploaded documents in the current space",
      parameters: z.object({
        query: z.string().describe("Search query")
      }),
      execute: async ({ query }) => {
        // Generate query embedding
        const queryVector = await generateEmbedding(query);
        
        // Perform vector similarity search
        const results = await db.select()
          .from(embedding)
          .where(
            and(
              eq(embedding.spaceId, spaceId),
              sql`1 - (${embedding.vector} <=> ${queryVector}) > 0.3`
            )
          )
          .orderBy(sql`${embedding.vector} <=> ${queryVector}`)
          .limit(5);
        
        return results.map(r => ({
          content: r.content,
          fileName: r.fileName,
          similarity: r.distance
        }));
      }
    }),
    
    // Web search via Firecrawl
    webSearch: tool({
      description: "Search the internet for current information",
      parameters: z.object({
        query: z.string().describe("Web search query")
      }),
      execute: async ({ query }) => {
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query, limit: 3 })
        });
        return await response.json();
      }
    })
  };
  
  // Stream response with tool calling
  const result = streamText({
    model: provider("gpt-4-turbo"),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query }
    ],
    tools,
    maxSteps: 5  // Allow multiple tool calls
  });
  
  // Return readable stream
  return result.toDataStreamResponse();
}
```

**Streaming Flow:**

```
User Query
    ↓
┌───────────────────────────────────────┐
│ 1. Start streaming immediately       │
│    - Sends opening chunk to client   │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ 2. LLM decides if tools needed       │
│    - Analyzes query intent           │
│    - Determines which tools to call  │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ 3. Execute tools in parallel         │
│    - docSearch: Vector similarity    │
│    - webSearch: Firecrawl API        │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ 4. Inject results into stream        │
│    - Tool results appear mid-stream  │
│    - LLM continues generating        │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ 5. Format with citations             │
│    - Links to source documents       │
│    - Footnote-style references       │
└───────────────────────────────────────┘
    ↓
Complete Response with Sources
```

**System Prompt** (from `lib/prompts.ts`):
```typescript
export const SYSTEM_PROMPT = `You are Curiositi, an AI assistant that helps users find information from their documents and the web.

When answering questions:
1. Search the user's documents first using docSearch
2. If documents don't contain the answer, use webSearch
3. Always cite your sources with [1], [2] notation
4. Be concise but thorough
5. If you're unsure, say so

Current space: {spaceName}
Available tools: docSearch, webSearch`;
```

### Authentication Flow

**Session Management with better-auth:**

```typescript
// Server setup (apps/server/src/lib/auth.ts)
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === "true"
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || []
});
```

**Request Flow:**

```
1. User submits login form
   ↓
2. POST /api/auth/sign-in/email { email, password }
   ↓
3. better-auth validates credentials
   ↓
4. Creates session in database
   ↓
5. Sets HTTP-only cookie: better-auth.session_token
   ↓
6. Returns user object to frontend
   ↓
7. All subsequent API calls include cookie
   ↓
8. Middleware validates session on each request
```

**Middleware Validation:**
```typescript
// All /api/v1/* routes protected
apiRouter.use("*", async (c, next) => {
  const session = await auth.api.getSession({ 
    headers: c.req.raw.headers 
  });
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // Attach user to context for use in handlers
  c.set("user", session.user);
  c.set("session", session.session);
  
  return next();
});
```

## API Design

### Route Structure

All API endpoints are prefixed with `/api/v1` and require authentication (except auth routes).

**Base URL**: `http://localhost:3030` (development) or your production server

### Authentication Routes (`/api/auth/*`)

Handled by `better-auth` library:

```bash
# Sign up
POST /api/auth/sign-up/email
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

# Sign in
POST /api/auth/sign-in/email
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securepassword"
}

# Sign out
POST /api/auth/sign-out

# Get session
GET /api/auth/session

# Request password reset
POST /api/auth/forget-password
{
  "email": "user@example.com",
  "redirectTo": "http://localhost:3040/reset-password"
}

# Reset password
POST /api/auth/reset-password
{
  "token": "reset-token",
  "password": "newpassword"
}

# Verify email
POST /api/auth/verify-email
{
  "token": "verification-token"
}
```

### Spaces API (`/api/v1/spaces`)

```bash
# List all user's spaces
GET /api/v1/spaces
Response: {
  "spaces": [
    {
      "id": "space-uuid",
      "name": "Research Papers",
      "description": "Academic papers collection",
      "icon": "📚",
      "userId": "user-uuid",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}

# Create new space
POST /api/v1/spaces
Content-Type: application/json
{
  "name": "Project Documentation",
  "description": "Internal docs",
  "icon": "📖"
}

# Get space by ID
GET /api/v1/spaces/:id

# Update space
PATCH /api/v1/spaces/:id
{
  "name": "Updated Name",
  "description": "Updated description"
}

# Delete space (cascade deletes files, embeddings, threads)
DELETE /api/v1/spaces/:id
```

### Files API (`/api/v1/files`)

```bash
# Get all files for a user
GET /api/v1/files/all
Response: {
  "files": [
    {
      "id": "file-uuid",
      "name": "document.pdf",
      "spaceId": "space-uuid",
      "mimeType": "application/pdf",
      "size": 1048576,
      "path": "/uploads/space-uuid/document.pdf",
      "status": "indexed",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}

# Get files in specific space
GET /api/v1/files/:spaceId

# Upload file
POST /api/v1/files/upload
Content-Type: multipart/form-data
spaceId: space-uuid
file: <binary data>

Response: {
  "file": {
    "id": "file-uuid",
    "name": "document.pdf",
    "status": "processing"
  }
}

# Delete file
DELETE /api/v1/files/:spaceId/:fileId
```

### Threads API (`/api/v1/threads`)

```bash
# List all threads
GET /api/v1/threads
Query params: ?spaceId=space-uuid (optional)

# Get thread by ID
GET /api/v1/threads/:id

# Create new thread
POST /api/v1/threads
{
  "spaceId": "space-uuid",
  "title": "Discussion about AI" (optional, auto-generated if empty)
}

# Update thread
PATCH /api/v1/threads/:id
{
  "title": "Updated Title"
}

# Delete thread
DELETE /api/v1/threads/:id

# Get thread messages
GET /api/v1/threads/:id/messages
Response: {
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What is this document about?",
      "threadId": "thread-uuid",
      "sources": null,
      "createdAt": "2025-01-15T11:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Based on the document...",
      "sources": [
        {
          "fileName": "document.pdf",
          "content": "Relevant chunk...",
          "similarity": 0.87
        }
      ],
      "provider": "openai",
      "model": "gpt-4-turbo",
      "createdAt": "2025-01-15T11:00:05Z"
    }
  ]
}
```

### Search API (`/api/v1/search`)

```bash
# Synchronous search (no streaming)
POST /api/v1/search
{
  "query": "What is machine learning?",
  "spaceId": "space-uuid"
}
Response: {
  "results": [
    {
      "content": "Machine learning is a subset of AI...",
      "fileName": "ml-guide.pdf",
      "similarity": 0.89,
      "metadata": { "page": 3 }
    }
  ]
}

# Streaming search with agent (Server-Sent Events)
POST /api/v1/search/stream
Content-Type: application/json
{
  "query": "Explain quantum computing",
  "spaceId": "space-uuid",
  "threadId": "thread-uuid" (optional)
}

# Response: text/event-stream
data: {"type":"text","content":"Based on your documents"}
data: {"type":"tool_call","tool":"docSearch","status":"started"}
data: {"type":"tool_result","results":[...]}
data: {"type":"text","content":" quantum computing refers to..."}
data: {"type":"done"}
```

### User Settings API (`/api/v1/user`)

```bash
# Get user settings
GET /api/v1/user/settings
Response: {
  "settings": {
    "defaultProvider": "openai",
    "defaultModel": "gpt-4-turbo",
    "defaultEmbeddingProvider": "openai",
    "defaultEmbeddingModel": "text-embedding-3-small"
  }
}

# Update settings
POST /api/v1/user/settings
{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-3-5-sonnet"
}
```

### Configs API (`/api/v1/configs`)

User-specific API keys (stored encrypted):

```bash
# Get user API configs
GET /api/v1/configs

# Create/update API key config
POST /api/v1/configs
{
  "provider": "openai",
  "apiKey": "sk-proj-..."
}

# Delete API key config
DELETE /api/v1/configs/:provider
```

### Error Responses

All errors follow consistent format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Authenticated but no access
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error

### OpenAPI Documentation

The API exposes an OpenAPI 3.0 specification at `/doc`:

```bash
GET http://localhost:3030/doc
```

This can be imported into Postman, Bruno, or Swagger UI for interactive testing.

## Security Architecture

### Authentication & Authorization

**Session-Based Auth with better-auth:**
- HTTP-only cookies prevent XSS attacks
- Secure flag enforced in production (HTTPS only)
- SameSite=Lax prevents CSRF
- 7-day session expiration with auto-refresh
- Session tokens stored in database with user agent tracking

**Access Control:**
```typescript
// Row-level security enforced at application layer
export async function getSpaces(userId: string) {
  // Users can only access their own spaces
  return await db.select()
    .from(space)
    .where(eq(space.userId, userId));
}

export async function getFiles(spaceId: string, userId: string) {
  // Verify user owns the space before returning files
  const spaceOwner = await db.select({ userId: space.userId })
    .from(space)
    .where(eq(space.id, spaceId))
    .limit(1);
    
  if (spaceOwner[0]?.userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return await db.select()
    .from(file)
    .where(eq(file.spaceId, spaceId));
}
```

**API Key Security:**
- User-provided API keys stored encrypted in database
- Keys decrypted only when making LLM requests
- Never logged or exposed in responses
- Per-user isolation (no shared keys)

### Data Protection

**Input Validation:**
```typescript
// All inputs validated with Zod schemas
import { z } from "zod";

const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().emoji().optional()
});

// Usage in routes
app.post("/api/v1/spaces", async (c) => {
  const body = await c.req.json();
  const validated = createSpaceSchema.parse(body); // Throws if invalid
  // ... proceed with validated data
});
```

**SQL Injection Prevention:**
- Drizzle ORM uses parameterized queries exclusively
- No raw SQL string concatenation
- Query builder ensures type safety

**File Upload Security:**
```typescript
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.oasis.opendocument.spreadsheet",
  "text/plain",
  "text/csv",
  "text/markdown"
];

// Validate on upload
if (!ALLOWED_MIME_TYPES.includes(file.type)) {
  throw new Error("File type not allowed");
}

// Max file size: 50MB (configurable)
const MAX_FILE_SIZE = 50 * 1024 * 1024;
if (file.size > MAX_FILE_SIZE) {
  throw new Error("File too large");
}
```

### Network Security

**CORS Configuration:**
```typescript
// Strict origin validation
const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS?.split(",") || [
  "http://localhost:3040",
  "http://localhost:3030"
];

app.use("*", cors({
  origin: TRUSTED_ORIGINS,  // Only allow specific origins
  credentials: true,        // Allow cookies
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  maxAge: 600               // Cache preflight for 10 minutes
}));
```

**Rate Limiting** (configurable):
```typescript
// Future implementation placeholder
import { rateLimiter } from "hono-rate-limiter";

app.use("/api/*", rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("remote-addr")
}));
```

**Environment Variable Security:**
- Never commit `.env` files to version control
- Production secrets managed via environment or secrets manager
- Sentry DSN is the only non-sensitive key that may be public

## Performance Optimizations

### Database Performance

**Indexing Strategy:**
```sql
-- Vector similarity (HNSW for approximate nearest neighbor)
CREATE INDEX embedding_vector_idx ON embedding 
USING hnsw (vector vector_cosine_ops);

-- Foreign key lookups
CREATE INDEX embedding_file_id_idx ON embedding (file_id);
CREATE INDEX embedding_space_id_idx ON embedding (space_id);
CREATE INDEX file_space_id_idx ON file (space_id);
CREATE INDEX file_user_id_idx ON file (user_id);
CREATE INDEX thread_space_id_idx ON thread (space_id);
CREATE INDEX thread_user_id_idx ON thread (user_id);
CREATE INDEX message_thread_id_idx ON message (thread_id);

-- Session lookups
CREATE INDEX session_user_id_idx ON session (user_id);
CREATE INDEX session_expires_at_idx ON session (expires_at);
```

**Query Optimization:**
```typescript
// Efficient joins to avoid N+1 queries
const filesWithSpaceInfo = await db.select({
  file: file,
  space: {
    id: space.id,
    name: space.name
  }
})
.from(file)
.innerJoin(space, eq(file.spaceId, space.id))
.where(eq(file.userId, userId));

// Use LIMIT for large result sets
const recentMessages = await db.select()
  .from(message)
  .where(eq(message.threadId, threadId))
  .orderBy(desc(message.createdAt))
  .limit(50);
```

**Connection Pooling:**
```typescript
// Drizzle + postgres.js uses connection pooling by default
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,           // Max connections in pool
  idle_timeout: 20   // Idle connection timeout (seconds)
});

export const db = drizzle(client);
```

### Caching Strategy

**Client-Side Caching (TanStack Query):**
```typescript
// apps/web/src/hooks/use-spaces.ts
export function useSpaces() {
  return useQuery({
    queryKey: ["spaces"],
    queryFn: () => getSpaces(),
    staleTime: 5 * 60 * 1000,     // 5 minutes
    gcTime: 10 * 60 * 1000        // Garbage collect after 10 min
  });
}

// Optimistic updates for instant feedback
const { mutate } = useMutation({
  mutationFn: createSpace,
  onMutate: async (newSpace) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["spaces"] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(["spaces"]);
    
    // Optimistically update
    queryClient.setQueryData(["spaces"], (old) => [...old, newSpace]);
    
    return { previous };
  },
  onError: (err, newSpace, context) => {
    // Rollback on error
    queryClient.setQueryData(["spaces"], context.previous);
  },
  onSettled: () => {
    // Refetch to sync with server
    queryClient.invalidateQueries({ queryKey: ["spaces"] });
  }
});
```

**Embedding Caching:**
```typescript
// Avoid re-embedding identical content
const embeddingCache = new Map<string, number[]>();

export async function generateEmbedding(text: string): Promise<number[]> {
  const hash = createHash("sha256").update(text).digest("hex");
  
  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash)!;
  }
  
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  
  const vector = embedding.data[0].embedding;
  embeddingCache.set(hash, vector);
  return vector;
}
```

### Streaming Optimizations

**Low-Latency Streaming:**
```typescript
// Start streaming immediately, don't wait for full response
export async function streamSearch(query: string, spaceId: string) {
  const stream = await searchAgent(query, spaceId);
  
  // Return stream immediately (Time to First Byte < 100ms)
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
```

**Parallel Tool Execution:**
```typescript
// SearchAgent executes multiple tools concurrently
const result = streamText({
  model,
  tools: { docSearch, webSearch },
  maxSteps: 5,
  experimental_parallelToolCalls: true  // Enable parallel execution
});
```

## Deployment Architecture

### Development Environment

**Local Development:**
```bash
# Prerequisites
- PostgreSQL 16+ with pgvector
- Bun 1.0.0+
- OpenAI/Anthropic API key

# Setup
bun install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
bun run db:migrate
bun run dev

# Services
- Web: http://localhost:3040
- API: http://localhost:3030
- Docs: http://localhost:4321
```

**Docker Development** (requires fixes to docker-compose.yml):
```yaml
# Note: Current docker-compose.yml has outdated paths
# Needs update from ./server to ./apps/server, etc.

services:
  postgres:
    image: pgvector/pgvector:pg16  # Must use pgvector image
    environment:
      POSTGRES_DB: curiositi
      POSTGRES_USER: curiositi
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  server:
    build: ./apps/server
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://curiositi:password@postgres:5432/curiositi
  
  web:
    build: ./apps/web
    depends_on:
      - server
    environment:
      NEXT_PUBLIC_SERVER_URL: http://localhost:3030
```

### Production Deployment

**Recommended Stack:**

```
┌─────────────┐
│   Cloudflare │  ← DNS + CDN
│   or Vercel  │
└─────────────┘
       │
       ▼
┌─────────────┐
│   Caddy or   │  ← Reverse proxy + SSL
│     Nginx    │
└─────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Web (Next) │   │ Server (Bun)│   │  PostgreSQL │
│   Docker    │   │   Docker    │   │   Managed   │
│   Container │   │   Container │   │   (Neon,    │
│             │   │             │   │   Supabase) │
└─────────────┘   └─────────────┘   └─────────────┘
```

**Environment Setup:**
```bash
# Production environment variables
NODE_ENV=production
SERVER_PORT=3030
DATABASE_URL=postgresql://user:pass@db.host:5432/curiositi?sslmode=require

# Security
BETTER_AUTH_SECRET=<64-char-random-string>
BETTER_AUTH_URL=https://api.yourdomain.com
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SIGNUP=false  # Disable public signup if needed

# Email (production requires email verification)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# LLM Providers
OPENAI_API_KEY=sk-proj-...
DEFAULT_EMBEDDING_PROVIDER=OPENAI
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small

# Optional
FIRECRAWL_API_KEY=fc-...
SENTRY_DSN=https://...@sentry.io/...

# Frontend
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SERVER_URL=https://api.yourdomain.com
```

**Docker Production Build:**
```dockerfile
# apps/server/Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Run migrations and start
CMD bun run db:migrate && bun run start
```

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

**Scaling Considerations:**
- **Horizontal Scaling**: Run multiple API server instances behind load balancer
- **Database**: Use managed PostgreSQL with connection pooling (PgBouncer)
- **File Storage**: Migrate from local disk to S3/R2 for multi-instance deployments
- **Session Store**: Add Redis for distributed session caching (optional)
- **Monitoring**: Sentry for error tracking, custom metrics for usage

## Extensibility Points

### Adding New LLM Providers

The system uses Vercel AI SDK, which supports multiple providers out of the box.

**1. Add Provider Configuration** (`lib/llms.ts`):
```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@ai-sdk/openrouter";
import { createGroq } from "@ai-sdk/groq";  // New provider

export function getLLMProvider(provider: string, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "openrouter":
      return createOpenRouter({ apiKey });
    case "groq":  // Add new provider
      return createGroq({ apiKey });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

**2. Update Models List** (`models-list.ts`):
```typescript
export const AVAILABLE_MODELS = {
  openai: ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
  openrouter: ["meta-llama/llama-3.1-405b-instruct"],
  groq: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"]  // New models
};
```

**3. Update Database Schema** (if storing API keys):
```typescript
// Add to config table or user settings
export const config = pgTable("config", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  provider: text("provider"), // "openai", "anthropic", "groq", etc.
  apiKey: text("api_key"),    // Encrypted
  createdAt: timestamp("created_at").defaultNow()
});
```

**4. Update Frontend UI** (`apps/web/src/app/app/settings/page.tsx`):
```typescript
const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "groq", label: "Groq" }  // Add to dropdown
];
```

### Adding New File Types

**1. Update MIME Type Allowlist** (`constants.ts`):
```typescript
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // ... existing types ...
  "application/epub+zip",  // Add EPUB support
];

export const FILE_EXTENSIONS = {
  "application/epub+zip": [".epub"],
  // ... existing mappings ...
};
```

**2. Implement Text Extractor** (`services/ingestion.ts`):
```typescript
import EPub from "epub";  // Install: bun add epub

export async function extractText(file: File): Promise<string> {
  switch (file.type) {
    case "application/pdf":
      return await extractPDF(file);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return await extractDOCX(file);
    // ... existing cases ...
    case "application/epub+zip":
      return await extractEPUB(file);
    default:
      throw new Error("Unsupported file type");
  }
}

async function extractEPUB(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const epub = await EPub.createAsync(Buffer.from(buffer));
  
  const chapters = await Promise.all(
    epub.flow.map(chapter => epub.getChapterAsync(chapter.id))
  );
  
  return chapters.join("\n\n");
}
```

**3. Add File Icon** (frontend):
```typescript
// apps/web/src/components/app/FileIcon.tsx
export function getFileIcon(mimeType: string) {
  const icons = {
    "application/pdf": <FileText className="h-4 w-4" />,
    "application/epub+zip": <Book className="h-4 w-4" />,  // Add icon
    // ... existing icons ...
  };
  return icons[mimeType] || <File className="h-4 w-4" />;
}
```

**4. Test Thoroughly:**
```typescript
// apps/server/src/services/__tests__/ingestion.test.ts
describe("EPUB ingestion", () => {
  it("should extract text from EPUB file", async () => {
    const file = new File([epubBuffer], "book.epub", { 
      type: "application/epub+zip" 
    });
    const text = await extractText(file);
    expect(text).toContain("Expected chapter content");
  });
});
```

### Adding New Search Tools

Tools are defined in `apps/server/src/tools/` and registered with the SearchAgent.

**1. Create Tool Definition** (`tools/calculator.ts`):
```typescript
import { tool } from "ai";
import { z } from "zod";

export const calculatorTool = tool({
  description: "Perform mathematical calculations",
  parameters: z.object({
    expression: z.string().describe("Math expression to evaluate (e.g., '2 + 2')")
  }),
  execute: async ({ expression }) => {
    try {
      // Use safe-eval or math.js library
      const result = evaluate(expression);
      return {
        expression,
        result,
        formatted: `${expression} = ${result}`
      };
    } catch (error) {
      return {
        error: "Invalid mathematical expression",
        expression
      };
    }
  }
});
```

**2. Register with Agent** (`agents/search-agent.ts`):
```typescript
import { docSearchTool } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import { calculatorTool } from "@/tools/calculator";  // Import new tool

export async function searchAgent(...) {
  const result = streamText({
    model,
    tools: {
      docSearch: docSearchTool,
      webSearch: webSearchTool,
      calculator: calculatorTool  // Register tool
    },
    maxSteps: 5
  });
  
  return result.toDataStreamResponse();
}
```

**3. Update System Prompt** (`lib/prompts.ts`):
```typescript
export const SYSTEM_PROMPT = `You are Curiositi, an AI assistant.

Available tools:
- docSearch: Search user's uploaded documents
- webSearch: Search the internet for current information
- calculator: Perform mathematical calculations

Use tools when appropriate to provide accurate answers.`;
```

**4. Handle Tool Results in Frontend** (if special formatting needed):
```typescript
// apps/web/src/components/app/ToolResult.tsx
export function ToolResult({ tool, result }) {
  switch (tool) {
    case "calculator":
      return (
        <div className="bg-blue-50 p-4 rounded">
          <code className="text-lg">{result.formatted}</code>
        </div>
      );
    // ... other cases ...
  }
}
```

## Monitoring & Observability

### Error Tracking with Sentry

**Server-Side** (`apps/server/src/index.ts`):
```typescript
import * as Sentry from "@sentry/bun";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,  // 10% of transactions
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Postgres()
    ]
  });
}

// Capture errors in routes
app.onError((err, c) => {
  Sentry.captureException(err, {
    extra: {
      method: c.req.method,
      path: c.req.path,
      user: c.get("user")?.id
    }
  });
  
  return c.json({ error: "Internal server error" }, 500);
});
```

**Client-Side** (`apps/web/src/instrumentation.ts`):
```typescript
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1
    });
  }
}
```

### Application Metrics

**Custom Metrics Collection:**
```typescript
// Lightweight metrics tracking
class Metrics {
  private metrics = new Map<string, number>();
  
  increment(key: string, value = 1) {
    this.metrics.set(key, (this.metrics.get(key) || 0) + value);
  }
  
  gauge(key: string, value: number) {
    this.metrics.set(key, value);
  }
  
  async export() {
    return Object.fromEntries(this.metrics);
  }
}

export const metrics = new Metrics();

// Usage in routes
app.post("/api/v1/search/stream", async (c) => {
  metrics.increment("search.requests");
  const startTime = Date.now();
  
  try {
    const response = await searchAgent(...);
    metrics.gauge("search.latency", Date.now() - startTime);
    metrics.increment("search.success");
    return response;
  } catch (error) {
    metrics.increment("search.errors");
    throw error;
  }
});

// Expose metrics endpoint
app.get("/metrics", async (c) => {
  return c.json(await metrics.export());
});
```

**Monitored Metrics:**
- **Response Times**: API endpoint latency (p50, p95, p99)
- **Error Rates**: 4xx and 5xx responses per endpoint
- **Usage Patterns**: Requests per user, queries per space
- **Database**: Query performance, connection pool usage
- **Token Usage**: LLM API token consumption by provider/model
- **Vector Search**: Query times, result counts, similarity scores
- **Streaming**: Time to first token, completion rates, tool calls
- **File Uploads**: Processing time, file sizes, success rates

### Logging Strategy

**Structured Logging:**
```typescript
import { logger } from "hono/logger";

// Hono logger middleware provides:
// <-- GET /api/v1/spaces
// --> GET /api/v1/spaces 200 45ms

// Custom structured logs
export function log(level: string, message: string, metadata?: object) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };
  
  if (level === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

// Usage
log("INFO", "File uploaded", { 
  userId: user.id, 
  fileId: file.id, 
  size: file.size 
});

log("ERROR", "Embedding generation failed", { 
  fileId: file.id, 
  provider: "openai",
  error: err.message 
});
```

**Log Levels:**
- **ERROR**: Exceptions, failed operations
- **WARN**: Degraded performance, rate limits approaching
- **INFO**: Normal operations, user actions
- **DEBUG**: Detailed debugging information (development only)

### Health Checks

```typescript
// apps/server/src/index.ts
app.get("/health", async (c) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "dev",
    checks: {}
  };
  
  // Database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    health.checks.database = "healthy";
  } catch (error) {
    health.checks.database = "unhealthy";
    health.status = "degraded";
  }
  
  // pgvector extension
  try {
    await db.execute(sql`SELECT vector_dims(vector('[1,2,3]'))`);
    health.checks.pgvector = "healthy";
  } catch (error) {
    health.checks.pgvector = "unhealthy";
  }
  
  // LLM provider (optional check)
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      health.checks.openai = response.ok ? "healthy" : "unhealthy";
    } catch {
      health.checks.openai = "unreachable";
    }
  }
  
  return c.json(health, health.status === "ok" ? 200 : 503);
});
```

**Readiness vs Liveness:**
```typescript
// Liveness: Is the app running?
app.get("/healthz", (c) => c.json({ status: "alive" }));

// Readiness: Can the app serve traffic?
app.get("/readyz", async (c) => {
  const ready = await checkDatabaseConnection() && await checkRequiredEnvVars();
  return c.json({ status: ready ? "ready" : "not ready" }, ready ? 200 : 503);
});
```

## Future Architecture Evolution

### Planned Enhancements

**Multi-Tenancy:**
- Organization-level accounts with team members
- Role-based access control (admin, editor, viewer)
- Shared spaces across organization
- Usage quotas and billing per organization

**Advanced RAG Techniques:**
- Hybrid search (vector + keyword BM25)
- Re-ranking with cross-encoder models
- Query expansion and rewriting
- Multi-hop reasoning chains
- Contextual compression for long documents

**Real-Time Collaboration:**
- Live cursors in chat threads
- Shared document annotations
- Real-time notifications via WebSocket
- Collaborative space editing

**Plugin System:**
- Third-party tool integrations (Zapier, Make)
- Custom data connectors (Notion, Google Drive, Slack)
- Plugin marketplace
- Sandboxed execution environment

**Analytics & Insights:**
- Usage dashboards (queries, tokens, costs)
- Popular documents and topics
- Search effectiveness metrics
- Cost optimization recommendations

### Scalability Roadmap

**Phase 1: Current State**
- Single-region deployment
- PostgreSQL with pgvector
- File storage on disk
- Basic monitoring

**Phase 2: Horizontal Scaling** (10k+ users)
- Load-balanced API servers
- Connection pooling (PgBouncer)
- S3/R2 for file storage
- Redis for session caching
- CDN for static assets

**Phase 3: Multi-Region** (100k+ users)
- Database read replicas per region
- Distributed caching (Redis Cluster)
- Edge functions for auth
- Regional file storage
- Global load balancing

**Phase 4: Specialized Infrastructure** (1M+ users)
- Dedicated vector database (Pinecone, Weaviate, Qdrant)
- Message queue for background jobs (BullMQ, Kafka)
- Separate embedding service
- Multi-model deployment (A/B testing)
- Auto-scaling based on load

---

This architecture documentation reflects the actual implementation in the Curiositi codebase as of January 2025. For the latest updates, refer to the source code in the [GitHub repository](https://github.com/macintushar/curiositi).
