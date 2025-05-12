import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import { DATABASE_URL } from "@/constants";
import * as schema from "@/db/schema";

const client = new SQL(DATABASE_URL, { prepare: false });
const db = drizzle({ client, schema });

export default db;
