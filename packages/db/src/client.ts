import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL as string);
// You can specify any property from the postgres-js connection options
const db = drizzle({
	client: queryClient,
	connection: {
		url: process.env.DATABASE_URL,
		ssl: true,
	},
});

export default db;
