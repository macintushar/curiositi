import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import {
  createThreadHandler,
  deleteThreadHandler,
  getThreadMessagesHandler,
  getThreadsHandler,
} from "@/services/threads";

const threadsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

threadsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { data, error } = await tryCatch(getThreadsHandler(user.id));
  if (error) {
    return c.json({ error: error.message || "Failed to get threads" }, 500);
  }
  return c.json(data);
});

threadsRouter.post("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { data, error } = await tryCatch(createThreadHandler(user.id));
  if (error) {
    return c.json({ error: error.message || "Failed to create thread" }, 500);
  }
  return c.json({ data: data.data[0] });
});

threadsRouter.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(deleteThreadHandler(id));
    if (error) {
      return c.json({ error: error.message || "Failed to delete thread" }, 500);
    }
    return c.json(data);
  },
);

threadsRouter.get(
  "/:id/messages",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(getThreadMessagesHandler(id));
    if (error) {
      console.error(error);
      return c.json(
        { error: error.message || "Failed to get thread messages" },
        500,
      );
    }
    return c.json(data);
  },
);

export default threadsRouter;
