import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CreateSpaceSchema, QuerySchema, UploadSchema } from "@/types/schemas";

// Service handlers
import {
  getSpacesHandler,
  createSpaceHandler,
  getSpaceHandler,
} from "@/services/spaces";
import { queryHandler, generalQueryHandler } from "@/services/query";
import {
  getFilesHandler,
  getFileHandler,
  deleteFileHandler,
} from "@/services/files";
import { uploadFileHandler } from "@/services/upload";

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

// Upload routes
apiRouter.post("/upload", zValidator("form", UploadSchema), uploadFileHandler);

// Query routes
apiRouter.post("/query", zValidator("json", QuerySchema), queryHandler);
apiRouter.post(
  "/query/general",
  zValidator("json", QuerySchema.omit({ space_id: true })),
  generalQueryHandler,
);

// Spaces routes
apiRouter.get("/spaces", getSpacesHandler);
apiRouter.post(
  "/spaces",
  zValidator("json", CreateSpaceSchema),
  createSpaceHandler,
);
apiRouter.get("/spaces/:id", getSpaceHandler);

// Files routes
apiRouter.get(
  "/files/:space_id",
  zValidator("param", z.object({ space_id: z.string() })),
  getFilesHandler,
);

apiRouter.post(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  getFileHandler,
);

apiRouter.delete(
  "/files/:space_id/:id",
  zValidator("param", z.object({ space_id: z.string(), id: z.string() })),
  deleteFileHandler,
);

export default apiRouter;
