import { DATABASE_URL } from "@/constants";
import { Pool } from "pg";

export const db = new Pool({
	connectionString: DATABASE_URL,
});
