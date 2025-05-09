import { pgTable, text, uuid } from "drizzle-orm/pg-core";
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
});
