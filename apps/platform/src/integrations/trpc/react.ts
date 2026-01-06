import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "@platform/integrations/trpc/router";

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>();
