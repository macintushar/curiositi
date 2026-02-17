# @curiositi/share/logger

A simple console logger with prefixed log levels.

## Methods

- `logger.info(msg, obj?)` - logs `[INFO] msg`
- `logger.warn(msg, obj?)` - logs `[WARN] msg`
- `logger.error(msg, obj?)` - logs `[ERROR] msg`
- `logger.debug(msg, obj?)` - logs `[DEBUG] msg`

## Usage

```ts
import logger from "@curiositi/share/logger";

logger.info("Processing file", { fileId: "abc" });
logger.error("Upload failed", error);
```
