import { z } from "zod";

export const UploadSchema = z.object({
  file: z.instanceof(File),
});

export type UploadSchemaType = z.infer<typeof UploadSchema>;

export const QuerySchema = z.object({
  input: z.string().min(1, '"input" cannot be empty'),
  model: z.string().optional().default("gemma3:1b"),
});

export type QuerySchemaType = z.infer<typeof QuerySchema>;
