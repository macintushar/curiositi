import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { tryCatch } from "@/lib/try-catch";
import { SearchSchema } from "@/types/schemas";
import { searchHandler } from "@/services/search";
import { auth } from "@/lib/auth";
import { executeSearchAgent } from "@/agents/search-agent";
import { formatHistory } from "@/lib/utils";
import db from "@/db";
import { messages, spaces } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const searchRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

searchRouter.post("/", zValidator("json", SearchSchema), async (c) => {
  const { input, model, space_ids, file_ids, provider, thread_id } =
    c.req.valid("json");

  const user = c.get("user");
  const userTime = c.req.header("X-User-Timezone");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await tryCatch(
    searchHandler({
      input: input,
      model: model,
      space_ids: space_ids,
      file_ids: file_ids,
      provider: provider,
      thread_id: thread_id,
      user: user,
      userTime: userTime ?? "",
    }),
  );

  if (error) {
    return c.json({ error: error.message || "Search failed" }, 500);
  }
  return c.json(data);
});

searchRouter.post("/stream", zValidator("json", SearchSchema), async (c) => {
  const { input, model, space_ids, provider, thread_id } = c.req.valid("json");

  const user = c.get("user");
  const userTime = c.req.header("X-User-Timezone");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const history = await db.query.messages.findMany({
      where: eq(messages.threadId, thread_id),
      columns: {
        role: true,
        content: true,
      },
    });

    const formattedHistory = formatHistory(history);

    let spaceMetadata: Array<{
      id: string;
      name: string;
      description?: string;
    }> = [];

    if (space_ids && space_ids.length > 0) {
      const { data: spacesData, error: spacesError } = await tryCatch(
        db.query.spaces.findMany({
          where: inArray(spaces.id, space_ids),
          columns: {
            id: true,
            name: true,
            description: true,
          },
        }),
      );

      if (spacesError) {
        console.error("Error fetching space metadata:", spacesError);
      } else {
        spaceMetadata = (spacesData || []).map((space) => ({
          id: space.id,
          name: space.name,
          description: space.description || undefined,
        }));
      }
    }

    const result = await executeSearchAgent({
      input,
      modelName: model,
      history: formattedHistory,
      spaces: spaceMetadata,
      enableWebSearch: true,
      provider,
      user,
      userTime: userTime ?? "",
      threadId: thread_id,
      maxDocQueries: 3,
      maxWebQueries: 2,
    });

    // Stream text to the client; includes the assistant's response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[SearchAgent] Stream error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Stream failed" },
      500,
    );
  }
});

export default searchRouter;
