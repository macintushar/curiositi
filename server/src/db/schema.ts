import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
  file_size: text("file_size").notNull(),
  space_id: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  hash: text("hash").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const spaces = pgTable("spaces", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
