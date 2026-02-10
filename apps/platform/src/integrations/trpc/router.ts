import { createTRPCRouter } from "./init";

import spaceRouter from "./routers/space";
import fileRouter from "./routers/file";

export const trpcRouter = createTRPCRouter({
	space: spaceRouter,
	file: fileRouter,
});
export type TRPCRouter = typeof trpcRouter;
