import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { getConfigs } from "@/services/configs";

const configsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

configsRouter.post("/", async (c) => {
  const { data, error } = await tryCatch(getConfigs());
  if (error) {
    console.error(error);
    return c.json({ error: error.message || "Failed to get configs" }, 500);
  }
  return c.json({ data });
});

export default configsRouter;
