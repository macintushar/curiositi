import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tryCatch } from "@/lib/try-catch";
import {
  AddOrUpdateApiKeySchema,
  CreateSpaceSchema,
  SearchSchema,
  UploadSchema,
} from "@/types/schemas";

// Service handlers
import {
  getSpacesHandler,
  createSpaceHandler,
  getSpaceHandler,
  deleteSpaceHandler,
} from "@/services/spaces";
import { searchHandler } from "@/services/search";
import {
  getFilesHandler,
  getFileHandler,
  deleteFileHandler,
} from "@/services/files";
import { uploadFileHandler } from "@/services/upload";
import {
  createThreadHandler,
  deleteThreadHandler,
  getThreadMessagesHandler,
  getThreadsHandler,
} from "@/services/threads";
import { getConfigs } from "@/services/configs";
import { addOrUpdateApiKey, getApiKeys } from "@/services/user";

const apiRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

apiRouter.basePath("/api/v1");

apiRouter.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return c.json(
      {
        error: "Unauthorized",
        details: "You are not authenticated",
      },
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});

apiRouter.get("/threads", async (c) => {
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

apiRouter.post("/threads", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { data, error } = await tryCatch(createThreadHandler(user.id));
  if (error) {
    return c.json({ error: error.message || "Failed to create thread" }, 500);
  }
  return c.json(data);
});

apiRouter.delete(
  "/threads/:id",
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

apiRouter.post(
  "/threads/:id/messages",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(getThreadMessagesHandler(id));
    if (error) {
      return c.json(
        { error: error.message || "Failed to get thread messages" },
        500,
      );
    }
    return c.json(data);
  },
);

// Search routes
apiRouter.post("/search", zValidator("json", SearchSchema), async (c) => {
  const { input, model, space_id, provider, thread_id } =
    await c.req.valid("json");

  const { data, error } = await tryCatch(
    searchHandler({
      input: input,
      model: model,
      space_id: space_id,
      provider: provider,
      thread_id: thread_id,
      mode: "space",
    }),
  );

  if (error) {
    return c.json({ error: error.message || "Search failed" }, 500);
  }
  return c.json(data);
});

apiRouter.post(
  "/search/general",
  zValidator("json", SearchSchema.omit({ space_id: true })),
  async (c) => {
    const { input, model, provider, thread_id } = await c.req.valid("json");
    const { data, error } = await tryCatch(
      searchHandler({
        input: input,
        model: model,
        provider: provider,
        thread_id: thread_id,
        mode: "general",
      }),
    );

    if (error) {
      return c.json({ error: error.message || "General search failed" }, 500);
    }
    return c.json(data);
  },
);

// Spaces routes
apiRouter.get("/spaces", async (c) => {
  const { data, error } = await tryCatch(getSpacesHandler());
  if (error) {
    return c.json({ error: error.message || "Failed to get spaces" }, 500);
  }
  return c.json(data);
});

apiRouter.post("/spaces", zValidator("json", CreateSpaceSchema), async (c) => {
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

apiRouter.get(
  "/spaces/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await tryCatch(getSpaceHandler(id));
    if (error) {
      return c.json({ error: error.message || "Failed to get space" }, 500);
    }
    return c.json(data);
  },
);

apiRouter.delete(
  "/spaces/:id",
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

// Files routes
apiRouter.post("/files/upload", zValidator("form", UploadSchema), async (c) => {
  const formData = await c.req.valid("form");
  const file = formData.file;
  const space_id = formData.space_id as string;
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!file || typeof file === "string") {
    return c.json(
      {
        error: "Invalid file upload",
        details: "No file was uploaded or invalid file format",
      },
      400,
    );
  }

  const { data, error } = await tryCatch(
    uploadFileHandler(file, space_id, user.id),
  );
  if (error) {
    return c.json({ error: error.message || "File upload failed" }, 500);
  }
  return c.json(data);
});

apiRouter.get(
  "/files/:space_id",
  zValidator("param", z.object({ space_id: z.string() })),
  async (c) => {
    const { space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(getFilesHandler(space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to get files" }, 500);
    }
    return c.json(data);
  },
);

apiRouter.post(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(getFileHandler(id, space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to get file" }, 404);
    }
    c.header("Content-Type", data.contentType);
    c.header("Content-Disposition", `attachment; filename="${data.fileName}"`);
    return c.body(data.data);
  },
);

apiRouter.delete(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    const { data, error } = await tryCatch(deleteFileHandler(id, space_id));
    if (error) {
      return c.json({ error: error.message || "Failed to delete file" }, 404);
    }
    return c.json(data);
  },
);

apiRouter.post(
  "/configs",
  zValidator("json", z.object({ invalidate_cache: z.boolean().optional() })),
  async (c) => {
    const { invalidate_cache } = await c.req.valid("json");
    const { data, error } = await tryCatch(getConfigs(invalidate_cache));
    if (error) {
      return c.json({ error: error.message || "Failed to get configs" }, 500);
    }
    return c.json({ data });
  },
);

apiRouter.get("/user/settings", async (c) => {
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

apiRouter.post(
  "/user/settings",
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

export default apiRouter;
