# @curiositi/share

Shared utilities used across the Curiositi monorepo.

## Exports

| Export path              | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `@curiositi/share/logger`    | Simple console logger with `info`, `warn`, `error`, `debug` methods |
| `@curiositi/share/fs/read`   | Read files from S3-compatible storage using Bun's S3Client |
| `@curiositi/share/fs/write`  | Write/delete files in S3-compatible storage              |
| `@curiositi/share/schemas`   | Shared Zod schemas                                       |
| `@curiositi/share/constants` | Constants (MIME types, MAX_FILE_SIZE, allowed file types) |
| `@curiositi/share/types`     | Shared TypeScript types (S3Config, etc.)                 |
| `@curiositi/share/ai`        | AI model definitions (OpenAI + Google providers via Vercel AI SDK) |

## Usage

```ts
import logger from "@curiositi/share/logger";
import { MAX_FILE_SIZE } from "@curiositi/share/constants";
```
