import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.POSTGRES_URL as string);
// You can specify any property from the postgres-js connection options
const db = drizzle({
	client: queryClient,
	connection: {
		url: process.env.POSTGRES_URL,
		ssl: true,
	},
	casing: "snake_case",
});

export default db;
