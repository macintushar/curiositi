import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../init";
import type { TRPCRouterRecord } from "@trpc/server";
import { getPendingInvitationsForEmail } from "@curiositi/api-handlers";
import { auth } from "@platform/lib/auth";

const invitationRouter = {
	getPending: protectedProcedure.query(async ({ ctx }) => {
		const userEmail = ctx.session.user.email;
		if (!userEmail) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User email not found",
			});
		}

		try {
			const invitations = await auth.api.listUserInvitations({
				query: { email: userEmail },
			});
			return { invitations };
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch invitations. Err:" + error,
			});
		}
	}),
} satisfies TRPCRouterRecord;

export default invitationRouter;
