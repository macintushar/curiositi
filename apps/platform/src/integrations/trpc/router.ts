import { createTRPCRouter } from "./init";

import spaceRouter from "./routers/space";
import fileRouter from "./routers/file";
import invitationRouter from "./routers/invitation";
import agentRouter from "./routers/agent";
import chatRouter from "./routers/chat";
import toolsRouter from "./routers/tools";

export const trpcRouter = createTRPCRouter({
	space: spaceRouter,
	file: fileRouter,
	invitation: invitationRouter,
	agent: agentRouter,
	chat: chatRouter,
	tools: toolsRouter,
});
export type TRPCRouter = typeof trpcRouter;
