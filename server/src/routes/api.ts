import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CreateSpaceSchema, SearchSchema, UploadSchema } from "@/types/schemas";

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
  const result = await getThreadsHandler(user.id);
  return c.json(result);
});

apiRouter.post("/threads", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const result = await createThreadHandler(user.id);
  return c.json(result);
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
    const result = await deleteThreadHandler(id);
    return c.json(result);
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
    const result = await getThreadMessagesHandler(id);
    return c.json(result);
  },
);

// Search routes
apiRouter.post("/search", zValidator("json", SearchSchema), async (c) => {
  const { input, model, space_id, provider, thread_id } =
    await c.req.valid("json");

  const result = await searchHandler({
    input: input,
    model: model,
    space_id: space_id,
    provider: provider,
    thread_id: thread_id,
    mode: "space",
  });
  return c.json(result);
});

apiRouter.post(
  "/search/general",
  zValidator("json", SearchSchema.omit({ space_id: true })),
  async (c) => {
    const { input, model, provider, thread_id } = await c.req.valid("json");
    const result = await searchHandler({
      input: input,
      model: model,
      provider: provider,
      thread_id: thread_id,
      mode: "general",
    });
    return c.json(result);
  },
);

// Spaces routes
apiRouter.get("/spaces", async (c) => {
  const result = await getSpacesHandler();
  return c.json(result);
});

apiRouter.post("/spaces", zValidator("json", CreateSpaceSchema), async (c) => {
  const { name } = await c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const result = await createSpaceHandler(name, user.id);
  return c.json(result);
});

apiRouter.get(
  "/spaces/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await getSpaceHandler(id);
    return c.json(result);
  },
);

apiRouter.delete(
  "/spaces/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await deleteSpaceHandler(id);
    if (result) {
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

  try {
    const result = await uploadFileHandler(file, space_id, user.id);
    return c.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Unknown error occurred" }, 500);
  }
});

apiRouter.get(
  "/files/:space_id",
  zValidator("param", z.object({ space_id: z.string() })),
  async (c) => {
    const { space_id } = c.req.valid("param");
    const result = await getFilesHandler(space_id);
    return c.json(result);
  },
);

apiRouter.post(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    try {
      const result = await getFileHandler(id, space_id);
      c.header("Content-Type", result.contentType);
      c.header(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`,
      );
      return c.body(result.data);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "Unknown error occurred" }, 500);
    }
  },
);

apiRouter.delete(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  async (c) => {
    const { id, space_id } = c.req.valid("param");
    try {
      const result = await deleteFileHandler(id, space_id);
      return c.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "Unknown error occurred" }, 500);
    }
  },
);

export default apiRouter;
