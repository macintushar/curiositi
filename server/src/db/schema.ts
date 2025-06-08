import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

// Define custom bytea type for PostgreSQL binary data
const bytea = (name: string) =>
  customType<{
    data: Buffer;
    driverData: string;
  }>({
    dataType() {
      return "bytea";
    },
    toDriver(value: Buffer): string {
      return `\\x${value.toString("hex")}`;
    },
  })(name);

export const files = pgTable("files", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  file: bytea("file").notNull(),
  fileSize: text("file_size").notNull(),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  hash: text("hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const spaces = pgTable("spaces", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon"),
  description: text("description"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const documents = pgTable("documents", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fileId: uuid("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  embedding: vector({ dimensions: 1024 }).notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const threads = pgTable("threads", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").default("Untitled"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  spaceId: uuid("space_id").references(() => spaces.id, {
    onDelete: "cascade",
  }),
});

export const messages = pgTable("messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  documentSearches: text("document_searches").array(),
  webSearches: text("web_searches").array(),
  documentSearchResults: text("document_search_results").array(),
  webSearchResults: text("web_search_results").array(),
});

export const settings = pgTable("settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  openaiApiKey: text("openai_api_key"),
  anthropicApiKey: text("anthropic_api_key"),
  openRouterApiKey: text("openrouter_api_key"),
  ollamaUrl: text("ollama_url"),
});
