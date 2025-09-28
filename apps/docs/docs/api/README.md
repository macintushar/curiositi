# API Reference

All endpoints are rooted at `/api/v1` and require an authenticated session unless explicitly stated. Responses are JSON unless noted.

| Category             | Router Path | File                |
| -------------------- | ----------- | ------------------- |
| Threads              | `/threads`  | `routes/threads.ts` |
| Search               | `/search`   | `routes/search.ts`  |
| Spaces               | `/spaces`   | `routes/spaces.ts`  |
| Files                | `/files`    | `routes/files.ts`   |
| User Settings / Keys | `/user`     | `routes/user.ts`    |
| Configs              | `/configs`  | `routes/configs.ts` |

Each section below lists available operations with method, path, request schema (if applicable), and typical responses.

## Authentication

All routes use a session cookie (Better Auth). If unauthenticated, a 401 response with `{ "error": "Unauthorized" }` is returned.

## Threads

### List Threads

```
GET /api/v1/threads
```

Response:

```json
[
  { "id": "uuid", "created_at": "ISO", ... }
]
```

### Create Thread

```
POST /api/v1/threads
```

Response:

```json
{ "data": { "id": "uuid", ... } }
```

### Delete Thread

```
DELETE /api/v1/threads/:id
```

Response:

```json
{ "success": true }
```

### Get Thread Messages

```
GET /api/v1/threads/:id/messages
```

Response (simplified):

```json
[{ "id": "uuid", "role": "user|assistant", "content": "..." }]
```

## Search

### Execute Search / Retrieval + Generation

```
POST /api/v1/search
Content-Type: application/json
```

Body:

```json
{
  "input": "query text",
  "model": "openai:gpt-4o-mini",
  "space_ids": ["space-id"],
  "file_ids": ["file-id"],
  "provider": "openai",
  "thread_id": null
}
```

Response (example):

```json
{
  "output": "answer text",
  "chunks": [{ "fileId": "...", "score": 0.83 }]
}
```

## Spaces

### List Spaces

```
GET /api/v1/spaces
```

### Create Space

```
POST /api/v1/spaces
Content-Type: application/json
```

Body:

```json
{ "name": "My Space", "icon": "📄", "description": "Optional" }
```

### Get Space

```
GET /api/v1/spaces/:id
```

### Delete Space

```
DELETE /api/v1/spaces/:id
```

## Files

### Upload File

Multipart form:

```
POST /api/v1/files/upload
Form fields: file=<binary>, space_id=<space>
```

### Get All Files (User Scoped)

```
GET /api/v1/files/all
```

### List Files in Space

```
GET /api/v1/files/:space_id
```

### Download File Content

```
POST /api/v1/files/:space_id/:id
```

Returns raw file bytes with appropriate headers.

### Delete File

```
DELETE /api/v1/files/:space_id/:id
```

## User

### Get API Keys (Settings)

```
GET /api/v1/user/settings
```

### Add/Update API Key (Settings)

```
POST /api/v1/user/settings
Content-Type: application/json
```

Body:

```json
{ "provider": "openai", "api_key": "sk-...", "url": "https://..." }
```

### List Keys (Raw)

```
GET /api/v1/user/keys
```

### Add/Update Key (Alternate Endpoint)

```
POST /api/v1/user/keys
```

## Configs

### Fetch Configs

```
POST /api/v1/configs
```

Returns server configuration bundle (e.g., enabled providers/models).

## Error Format

Typical error:

```json
{ "error": "Failed to create space" }
```

## Versioning

Current prefix: `v1`. Backwards-incompatible changes will introduce `v2` while keeping `v1` temporarily.
