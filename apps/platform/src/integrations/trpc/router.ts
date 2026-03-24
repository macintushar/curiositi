import { createTRPCRouter } from "./init";

import spaceRouter from "./routers/space";
import fileRouter from "./routers/file";
import invitationRouter from "./routers/invitation";

export const trpcRouter = createTRPCRouter({
	space: spaceRouter,
	file: fileRouter,
	invitation: invitationRouter,
});
export type TRPCRouter = typeof trpcRouter;
