---
title: Overview
description: Curiositi is an open-source AI knowledge workspace that lets you upload documents, organize them into spaces, and chat with an intelligent agent that answers using your knowledge and the web.
---

Curiositi is an open-source AI knowledge workspace that transforms how teams work with information. Upload your documents, organize them into spaces, and chat with an intelligent agent that seamlessly combines your private knowledge with web search to provide accurate, contextual answers.

## What Makes Curiositi Special

**Fast, Streaming Responses**: Unlike traditional RAG systems that wait to search before responding, Curiositi starts streaming answers immediately and intelligently decides whether to search your documents or the web mid-conversation.

**Hybrid Intelligence**: Your agent doesn't just search your files—it can combine your private knowledge with current web information for comprehensive answers.

**Secure & Private**: All your documents stay in your control. Authentication ensures only authorized users can access your knowledge spaces.

**Multi-Provider Support**: Choose from OpenAI, Anthropic, or OpenRouter models based on your needs and preferences.

## Key Features

### 📁 **Spaces & Organization**
Create dedicated spaces to organize your documents by project, department, or topic. Each space maintains its own knowledge base for focused, relevant searches.

### 📄 **Smart Document Ingestion**
Upload PDFs, Office documents, and text files. Curiositi automatically extracts text, splits it into meaningful chunks, and creates vector embeddings for semantic search.

### 🤖 **Intelligent Chat Agent**
- **Streaming responses** that start immediately
- **Context-aware conversations** with full chat history
- **Source citations** showing where information came from
- **Web search integration** for current information
- **Multi-turn conversations** with persistent context

### 🔍 **Powerful Search**
- **Semantic search** that understands meaning, not just keywords
- **Filtered results** by space, file, or conversation
- **Vector similarity** powered by pgvector and OpenAI embeddings
- **Hybrid retrieval** combining your documents with web results

### 🔐 **Secure Authentication**
- **Session-based auth** with better-auth
- **Per-user API keys** for LLM providers
- **Scoped access** to spaces and files
- **Optional email verification**

### 🛠️ **Developer-Friendly**
- **RESTful API** with comprehensive endpoints
- **TypeScript throughout** for type safety
- **Modular architecture** for easy extension
- **Docker deployment** ready

## How It Works

### The Agent Flow
1. **Immediate Streaming**: When you ask a question, the agent starts generating a response right away
2. **Smart Decision Making**: While streaming, the agent evaluates if it needs to search your documents or the web
3. **Parallel Search**: If search is needed, it executes document and web searches simultaneously
4. **Context Injection**: Search results are seamlessly integrated into the ongoing response
5. **Source Attribution**: All answers include citations showing the source of information

### Document Processing Pipeline
1. **Upload**: Files are securely uploaded and stored
2. **Text Extraction**: Content is extracted from PDFs, Office docs, and text files
3. **Intelligent Chunking**: Documents are split into meaningful sections
4. **Vector Embedding**: Each chunk gets a semantic vector representation
5. **Indexed Storage**: Embeddings are stored in PostgreSQL with pgvector for fast retrieval

## Supported File Types

- **PDF documents** (.pdf)
- **Office files** (.docx, .pptx, .xlsx, .odt, .odp, .ods)
- **Text files** (.txt, .csv, .md)

## Technology Stack

**Backend**: Bun + Hono API server with Drizzle ORM and PostgreSQL
**Frontend**: Next.js 15 with React 19, Tailwind CSS, and shadcn/ui
**AI/ML**: OpenAI/Anthropic embeddings, multiple LLM providers
**Search**: pgvector for vector similarity, Firecrawl for web search
**Deployment**: Docker containers, Vercel-ready

## Use Cases

**For Teams**:
- Company knowledge bases
- Project documentation
- Research and analysis
- Customer support knowledge
- Policy and procedure manuals

**For Individuals**:
- Personal research assistant
- Learning and study aid
- Writing and content creation
- Code documentation
- Personal knowledge management

## Getting Started

Ready to try Curiositi? Here are your next steps:

1. **[Quick Start](getting-started.md)**: Set up your development environment
2. **[Self-Hosting Guide](self-hosting.md)**: Deploy your own instance
3. **[API Reference](api/README.md)**: Integrate with your applications
4. **[Contributing](contributing.md)**: Join the development community

## Architecture at a Glance

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │   API Server    │    │   Database      │
│   (Next.js)     │◄──►│   (Hono/Bun)    │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │   + pgvector    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Upload    │    │  Agent & Search │    │  Vector Store   │
│  & Ingestion    │    │  (Streaming)    │    │  & Embeddings   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

Curiositi combines the best of modern web development with cutting-edge AI to create a powerful, user-friendly knowledge platform.
