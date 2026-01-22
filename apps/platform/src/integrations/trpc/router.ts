import { createTRPCRouter } from "./init";

import uploadRouter from "./routers/upload";
import spaceRouter from "./routers/space";
import fileRouter from "./routers/file";

export const trpcRouter = createTRPCRouter({
	upload: uploadRouter,
	space: spaceRouter,
	file: fileRouter,
});
export type TRPCRouter = typeof trpcRouter;
