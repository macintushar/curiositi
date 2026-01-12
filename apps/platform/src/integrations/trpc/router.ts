import { createTRPCRouter } from "./init";

import uploadRouter from "./routers/upload";
import spaceRouter from "./routers/space";

export const trpcRouter = createTRPCRouter({
	upload: uploadRouter,
	space: spaceRouter,
});
export type TRPCRouter = typeof trpcRouter;
