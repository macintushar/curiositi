# @curiositi/share/fs

S3-compatible file storage utilities using Bun's built-in `S3Client`.

All functions accept an `S3Config` object (`accessKeyId`, `secretAccessKey`, `bucket`, `endpoint`) to allow bring-your-own storage.

## Exports

### `@curiositi/share/fs/read`

```ts
read(path: string, config: S3Config): Promise<S3File>
```

Reads a file from S3-compatible storage.

### `@curiositi/share/fs/write`

```ts
write(path: string, data: string | File, config: S3Config): Promise<void>
deleteS3Object(path: string, config: S3Config): Promise<void>
```

Writes or deletes files in S3-compatible storage. Throws an `S3UploadError` on write failure.
