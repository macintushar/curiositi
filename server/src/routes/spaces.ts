import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { CreateSpaceSchema } from "@/types/schemas";
import {
  getSpacesHandler,
  createSpaceHandler,
  getSpaceHandler,
  deleteSpaceHandler,
} from "@/services/spaces";

const spacesRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

spacesRouter.get("/", async (c) => {
  const { data, error } = await tryCatch(getSpacesHandler());
  if (error) {
    return c.json({ error: error.message || "Failed to get spaces" }, 500);
  }
  return c.json(data);
});

spacesRouter.post("/", zValidator("json", CreateSpaceSchema), async (c) => {
  const { name, icon, description } = await c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { data, error } = await tryCatch(
    createSpaceHandler(name, user.id, icon ?? null, description ?? null),
  );
  if (error) {
    return c.json({ error: error.message || "Failed to create space" }, 500);
  }
  return c.json(data);
});

spacesRouter.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(getSpaceHandler(id));
    if (error) {
      return c.json({ error: error.message || "Failed to get space" }, 500);
    }
    if (!data.data || !data.data.space) {
      return c.json({ error: "Space not found" }, 404);
    }
    return c.json(data);
  },
);

spacesRouter.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(deleteSpaceHandler(id));
    if (error) {
      return c.json({ error: error.message || "Failed to delete space" }, 500);
    }
    if (data) {
      return c.json({ message: "Space deleted successfully" }, 200);
    }
    return c.json({ error: "Failed to delete space" }, 500);
  },
);

export default spacesRouter;
