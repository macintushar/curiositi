# Curiositi Server - Current Capabilities

## Overview

The Curiositi Server is a backend service built to power an AI-driven knowledge management and search system. It leverages various AI models, vector databases, and RAG (Retrieval-Augmented Generation) techniques to provide powerful search and question-answering capabilities across user-defined spaces and documents.

## Technical Stack

The server is built on the following technologies:

- **Runtime**: Built with [Bun](https://bun.sh/) for high-performance JavaScript/TypeScript execution
- **Web Framework**: [Hono](https://hono.dev/) for lightweight, fast HTTP services
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) for data management
- **Authentication**: [Better Auth](https://better-auth.dev/) for user authentication and session management
- **Vector Storage**: Native PostgreSQL vector capabilities for embedding storage and similarity search
- **AI Providers**:
  - Ollama for local model execution
  - OpenAI for cloud-based services
  - OpenRouter for access to various LLM models

## Core Capabilities

### Authentication and User Management

- Complete user authentication flow with email/password
- Session-based authentication
- User account management

### Knowledge Spaces

Spaces represent collections of documents organized for specific topics or purposes:

- Create, read, and delete spaces
- Associate spaces with users
- Organize documents within spaces
- Context-aware search within spaces

### Document Management

- Upload and store various document types:
  - PDF files
  - Plain text
  - CSV data
  - Markdown
- Document ingestion processing:
  - Text extraction
  - Chunking
  - Embedding generation
- Metadata tracking for files
- Document retrieval and download

### Semantic Search

- Vector-based similarity search using document embeddings
- Multiple embedding model providers:
  - Ollama (default, local)
  - OpenAI (cloud)
- Space-specific and general search options
- Relevance ranking of search results

### Conversational Memory

- Thread-based conversation history
- Message storage and retrieval
- Long-term memory for context retention
- Associating threads with specific spaces

### AI Capabilities

- RAG (Retrieval-Augmented Generation) for knowledge-enhanced responses
- Web search integration via SearXNG for up-to-date information
- Multi-provider model support:
  - Various Ollama models (local)
  - OpenAI models (when API key is provided)
  - OpenRouter models (when API key is provided)
- Context-aware responses using:
  - Space document context
  - Conversation history
  - Web search results (when enabled)

### API Interface

Complete RESTful API with endpoints for:

- Authentication and session management
- Space operations
- Document upload, download, and management
- Search functionality
- Conversation threads and messages
- Configuration and system settings

## Deployment Options

The server supports:

- Local development environment
- Docker container deployment
- Production environment with proper URL configurations

## Configuration

Configurable options include:

- Database connection settings
- Model provider selection
- API keys for third-party services
- Server ports and access controls
- Embedding model specifications

## Data Management

The database schema handles:

- User data and authentication
- File metadata and binary storage
- Document embeddings and content
- Space definitions and relationships
- Conversation threads and message history

## Future Expansion Potential

The architecture allows for easy extension with:

- Additional document formats
- New AI providers and models
- Enhanced search capabilities
- Integration with external services and APIs
- Custom agents and specialized tools
