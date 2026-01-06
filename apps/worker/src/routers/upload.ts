import { Hono } from "hono";
import uploadHandler from "../handlers/upload";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const uploadRouter = new Hono();

uploadRouter.post(
	"/",
	zValidator(
		"form",
		z.object({
			file: z.instanceof(File),
			userId: z.string(),
			orgId: z.string(),
		})
	),
	async (c) => {
		const { file, userId, orgId } = await c.req.valid("form");

		if (!file) {
			return c.json({ error: "No file uploaded" }, 400);
		}

		const res = uploadHandler({
			file,
			orgId,
			userId,
		});
		return c.json(res);
	}
);

export default uploadRouter;
