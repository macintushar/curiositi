import { Hono } from "hono";
import {
  addSpaceToDB,
  getSpaceFromDB,
  getSpacesFromDB,
} from "@/services/queries";
import { zValidator } from "@hono/zod-validator";
import { CreateSpaceSchema } from "@/types/schemas";

const spacesRouter = new Hono();

spacesRouter.get("/", async (c) => {
  const data = await getSpacesFromDB();
  return c.json({ data });
});

spacesRouter.post("/", zValidator("json", CreateSpaceSchema), async (c) => {
  const { name } = await c.req.valid("json");
  const data = await addSpaceToDB(name);
  return c.json({ data });
});

spacesRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const data = await getSpaceFromDB(id);
  return c.json({ data: data[0] });
});

export default spacesRouter;
