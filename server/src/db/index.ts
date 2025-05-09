import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import { DATABASE_URL } from "@/constants";

const client = new SQL(DATABASE_URL);
const db = drizzle({ client });

export default db;
