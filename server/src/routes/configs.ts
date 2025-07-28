import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { getConfigs } from "@/services/configs";

const configsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

configsRouter.post(
  "/",
  zValidator("json", z.object({ invalidate_cache: z.boolean().optional() })),
  async (c) => {
    const { invalidate_cache } = await c.req.valid("json");
    const { data, error } = await tryCatch(getConfigs(invalidate_cache));
    if (error) {
      console.error(error);
      return c.json({ error: error.message || "Failed to get configs" }, 500);
    }
    return c.json({ data });
  },
);

export default configsRouter;
