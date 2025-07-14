import { Hono } from "hono";
import { auth } from "@/lib/auth";

// Import individual routers
import threadsRouter from "./threads";
import searchRouter from "./search";
import spacesRouter from "./spaces";
import filesRouter from "./files";
import userRouter from "./user";
import configsRouter from "./configs";

const apiRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

apiRouter.basePath("/api/v1");

// Authentication middleware
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

  console.log(c.req.raw.headers);
  console.log(c.req.raw.body);

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});

// Mount individual routers
apiRouter.route("/threads", threadsRouter);
apiRouter.route("/search", searchRouter);
apiRouter.route("/spaces", spacesRouter);
apiRouter.route("/files", filesRouter);
apiRouter.route("/user", userRouter);
apiRouter.route("/configs", configsRouter);

export default apiRouter;
