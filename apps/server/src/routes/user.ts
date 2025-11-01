import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import { AddOrUpdateApiKeySchema } from "@/types/schemas";
import { addOrUpdateApiKey, getApiKeys } from "@/services/user";

const userRouter = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const getSettingsRoute = createRoute({
  method: "get",
  path: "/settings",
  summary: "Get user settings",
  description: "Retrieve the current user's API key settings",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: {
            data: {},
          },
        },
      },
      description: "User settings retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: {
            error: { type: "string" },
          },
        },
      },
      description: "Unauthorized",
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

userRouter.openapi(getSettingsRoute, async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await tryCatch(getApiKeys(user.id));
  if (error) {
    return c.json({ error: error.message || "Failed to get API keys" }, 500);
  }
  return c.json({ data: data[0] });
});

userRouter.post(
  "/settings",
  zValidator("json", AddOrUpdateApiKeySchema),
  async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { provider, api_key, url } = await c.req.valid("json");

    const { data, error } = await tryCatch(
      addOrUpdateApiKey(user.id, provider, {
        apiKey: api_key ?? "",
        url: url ?? "",
      }),
    );

    if (error) {
      return c.json(
        { error: error.message || "Failed to update API key" },
        500,
      );
    }
    return c.json({ data: { message: data } });
  },
);

userRouter.get("/keys", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const result = await getApiKeys(user.id);

  return c.json({ data: result });
});

userRouter.post(
  "/keys",
  zValidator("json", AddOrUpdateApiKeySchema),
  async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { provider, api_key, url } = await c.req.valid("json");

    const result = await addOrUpdateApiKey(user.id, provider, {
      apiKey: api_key ?? "",
      url: url ?? "",
    });

    return c.json({ data: { message: result } });
  },
);

export default userRouter;
