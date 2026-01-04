import db from "@curiositi/db/client";
import { posts } from "@curiositi/db/schema";
import logger from "@curiositi/share/logger";

export async function GET() {
	console.log(process.env.POSTGRES_URL);

	const res = await db.select().from(posts);

	logger.info("Result of DB Insert: ", res);
	return new Response("Hello");
}
