---
title: API Reference
description: Complete API documentation for integrating with Curiositi's REST endpoints.
---

Welcome to the Curiositi API. This reference reflects the current server implementation in apps/server.

Base URL and authentication

- Base URL: https://your-domain.com/api/v1
- Auth: All endpoints below require an authenticated session (cookie-based). If the session is missing or invalid, the API returns 401 { "error": "Unauthorized" }.
- Content types: JSON unless noted; file upload uses multipart/form-data.

Quick start

- List spaces
  curl -X GET https://your-domain.com/api/v1/spaces \
    -H "Cookie: your-session-cookie"

Core resources

- Spaces: containers to organize files
- Files: uploaded documents stored inside spaces
- Threads: chat conversations with history
- Search agent: retrieves context and generates answers

Authentication endpoints (handled by better-auth)

- POST /api/auth/sign-in
- POST /api/auth/sign-up
- POST /api/auth/sign-out
- GET  /api/auth/session

Spaces API

List spaces
- GET /api/v1/spaces
- Response
  {
    "data": [
      {
        "space": {
          "id": "space-uuid",
          "name": "Project Documentation",
          "icon": "📄",
          "description": "All project docs and specs",
          "createdBy": "user-id",
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-20T14:22:00.000Z"
        },
        "user": {
          "id": "user-id",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "image": null
        },
        "files": 15
      }
    ]
  }

Create space
- POST /api/v1/spaces
- Body
  {
    "name": "My New Space",
    "icon": "📁",          // optional
    "description": "Notes"  // optional
  }
- Response
  {
    "data": [
      {
        "id": "space-uuid",
        "name": "My New Space",
        "icon": "📁",
        "description": "Notes",
        "createdBy": "user-id",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }

Get space details
- GET /api/v1/spaces/{space_id}
- Response
  {
    "data": {
      "space": {
        "id": "space-uuid",
        "name": "Project Documentation",
        "icon": "📄",
        "description": "All project docs and specs",
        "createdBy": "user-id",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:22:00.000Z"
      },
      "user": {
        "id": "user-id",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "image": null
      }
    }
  }

Update space
- PUT /api/v1/spaces/{space_id}
- Body
  {
    "name": "Renamed Space",
    "icon": null,             // optional, nullable
    "description": "Updated" // optional, nullable
  }
- Response
  {
    "data": [
      {
        "id": "space-uuid",
        "name": "Renamed Space",
        "icon": null,
        "description": "Updated",
        "createdBy": "user-id",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-21T10:30:00.000Z"
      }
    ]
  }

Delete space
- DELETE /api/v1/spaces/{space_id}
- Response
  {
    "data": { "message": "Space deleted successfully" }
  }

Files API

Upload file
- POST /api/v1/files/upload
- Content-Type: multipart/form-data
- Form fields
  - file: the file to upload (PDF, Office, or text)
  - space_id: target space UUID
- Response
  {
    "data": {
      "message": "File 'document.pdf' processed successfully.",
      "file": {
        "id": "file-uuid",
        "name": "document.pdf",
        "type": "application/pdf",
        "size": "2457600",
        "spaceId": "space-uuid",
        "hash": "...sha256..."
      }
    }
  }

List all files (for the authenticated user)
- GET /api/v1/files/all
- Response
  {
    "data": [
      {
        "id": "file-uuid",
        "name": "document.pdf",
        "type": "application/pdf",
        "fileSize": "2457600",
        "spaceId": "space-uuid",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "spaceName": "Project Docs",
        "spaceIcon": "📄"
      }
    ]
  }

List files in a space
- GET /api/v1/files/{space_id}
- Response
  {
    "data": [
      {
        "id": "file-uuid",
        "name": "document.pdf",
        "type": "application/pdf",
        "fileSize": "2457600",
        "spaceId": "space-uuid",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }

Download a file
- POST /api/v1/files/{space_id}/{file_id}
- Response: Binary file content, with Content-Type and Content-Disposition headers.

Delete a file
- DELETE /api/v1/files/{space_id}/{file_id}
- Response
  {
    "message": "File deleted successfully"
  }

Threads API

List threads
- GET /api/v1/threads
- Response
  {
    "data": [
      {
        "id": "thread-uuid",
        "createdBy": "user-id",
        "title": "Untitled",
        "spaceId": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }

Create thread
- POST /api/v1/threads
- Body: empty
- Response
  {
    "data": {
      "id": "thread-uuid",
      "createdBy": "user-id",
      "title": "Untitled",
      "spaceId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }

Delete thread
- DELETE /api/v1/threads/{thread_id}
- Response
  {
    "data": { "message": "Thread deleted successfully." }
  }

Get thread messages
- GET /api/v1/threads/{thread_id}/messages
- Response
  {
    "data": [
      {
        "id": "msg-uuid",
        "role": "user",
        "content": "Question text",
        "threadId": "thread-uuid",
        "model": "gpt-4o-mini",
        "provider": "openai",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }

Search API

Synchronous search
- POST /api/v1/search
- Body
  {
    "input": "What are the key requirements?",
    "model": "gpt-4o-mini",
    "provider": "openai",         // one of: openai | anthropic | openrouter
    "thread_id": "thread-uuid",
    "space_ids": ["space-uuid"],  // optional
    "file_ids": ["file-uuid"]     // optional
  }
- Response (assistant message persisted to the thread and returned)
  {
    "data": {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "Answer text...",
      "threadId": "thread-uuid",
      "model": "gpt-4o-mini",
      "provider": "openai",
      "createdAt": "2024-01-15T10:30:05.000Z",
      "updatedAt": "2024-01-15T10:30:05.000Z"
    }
  }

Streaming search
- POST /api/v1/search/stream
- Body: same as synchronous search
- Response: A text stream of the assistant’s response (chunked plain text). No event envelope is guaranteed; treat the body as an incremental text stream until completion.
- Optional header: X-User-Timezone for timezone-aware prompts, e.g., X-User-Timezone: America/New_York

User settings API

Get settings
- GET /api/v1/user/settings
- Response
  {
    "data": {
      "id": "settings-uuid",
      "userId": "user-id",
      "openaiApiKey": "sk-...",        // decrypted value
      "anthropicApiKey": null,
      "openRouterApiKey": null
    }
  }
  Note: Keys are currently returned decrypted. Do not log these values. Masking may be added in a future release.

Update settings
- POST /api/v1/user/settings
- Body
  {
    "provider": "openai",     // openai | anthropic | openrouter
    "api_key": "sk-your-key", // note: snake_case
    "url": "https://api.openai.com/v1" // optional
  }
- Response
  {
    "data": { "message": "API key updated successfully" }
  }

Alternate keys endpoints
- GET /api/v1/user/keys -> { "data": [ { settings row }, ... ] }
- POST /api/v1/user/keys -> same body as /user/settings, returns { "data": { "message": "..." } }

Configuration API

Get configuration
- POST /api/v1/configs
- Response
  {
    "data": {
      "providers": [
        {
          "name": "openai",
          "title": "OpenAI",
          "enabled": true,
          "models": [
            { "name": "GPT-4o", "model": "gpt-4o", "capabilities": ["completion", "vision", "audio", "video"] },
            { "name": "GPT-4o mini", "model": "gpt-4o-mini", "capabilities": ["completion", "vision", "audio"] }
          ]
        }
      ],
      "file_types": [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.oasis.opendocument.presentation",
        "application/vnd.oasis.opendocument.spreadsheet"
      ]
    }
  }

Errors

- 400 Bad Request: Invalid request data
- 401 Unauthorized: Missing or invalid session
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error
- Error response shape
  { "error": "Message", "details": "Optional details" }

Notes and limitations

- Rate limiting headers are not currently emitted by the server.
- Health endpoints are not exposed via /api/v1.
- Streaming responses are plain text streams; no fixed SSE schema is guaranteed.

Changelog

- v1.0.0
  - Initial API
  - CRUD for spaces/files/threads
  - Synchronous and streaming search
  - User settings management

Support

- Troubleshooting: see the troubleshooting guide
- GitHub Issues: report bugs or request features
- Discussions/Community: links on the project README