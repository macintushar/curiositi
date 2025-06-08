import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { tryCatch } from "@/lib/try-catch";
import { SearchSchema } from "@/types/schemas";
import { searchHandler } from "@/services/search";
import { auth } from "@/lib/auth";

const searchRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

searchRouter.post("/", zValidator("json", SearchSchema), async (c) => {
  const { input, model, space_ids, file_ids, provider, thread_id } =
    await c.req.valid("json");

  const { data, error } = await tryCatch(
    searchHandler({
      input: input,
      model: model,
      space_ids: space_ids,
      file_ids: file_ids,
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

// searchRouter.post(
//   "/general",
//   zValidator("json", SearchSchema.omit({ space_id: true })),
//   async (c) => {
//     const { input, model, provider, thread_id } = await c.req.valid("json");
//     const { data, error } = await tryCatch(
//       searchHandler({
//         input: input,
//         model: model,
//         provider: provider,
//         thread_id: thread_id,
//         mode: "general",
//       }),
//     );

//     if (error) {
//       return c.json({ error: error.message || "General search failed" }, 500);
//     }
//     return c.json(data);
//   },
// );

export default searchRouter;
