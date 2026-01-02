import { Hono } from "hono";
import uploadHandler from "../handlers/upload";

const uploadRouter = new Hono();

uploadRouter.get("/", (c) => {
	return c.text("Hello Bono!");
});

uploadRouter.get("/gg", (c) => {
	console.log("Hello!");
	return c.text("Hello Jono!");
});

uploadRouter.post("/", async (c) => {
	const formData = await c.req.formData();
	const file = formData.get("file") as File;

	if (!file) {
		return c.json({ error: "No file uploaded" }, 400);
	}

	const res = uploadHandler(file);
	return c.json(res);
});

export default uploadRouter;
