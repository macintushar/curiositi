import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { getConfigs } from "@/services/configs";

const configsRouter = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const getConfigsRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Get application configs",
  description: "Retrieve application configuration settings",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: {
            data: {},
          },
        },
      },
      description: "Configs retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: {
            error: { type: "string" },
          },
        },
      },
      description: "Internal server error",
    },
  },
});

configsRouter.openapi(getConfigsRoute, async (c) => {
  const { data, error } = await tryCatch(getConfigs());
  if (error) {
    console.error(error);
    return c.json({ error: error.message || "Failed to get configs" }, 500);
  }
  return c.json({ data });
});

export default configsRouter;
