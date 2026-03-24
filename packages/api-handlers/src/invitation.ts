import { invitation, organization, user } from "@curiositi/db/schema";
import db from "@curiositi/db/client";
import { eq, and } from "@curiositi/db";
import { createResponse } from "./response";

type InvitationWithOrg = {
	id: string;
	email: string;
	inviterId: string;
	organizationId: string;
	role: string;
	status: string;
	createdAt: Date;
	expiresAt: Date;
	organization: {
		id: string;
		name: string;
		slug: string;
		logo: string | null;
	};
	inviter: {
		id: string;
		name: string | null;
		email: string;
		image: string | null;
	};
};

export async function getPendingInvitationsForEmail(userEmail: string) {
	try {
		const result = await db
			.select({
				id: invitation.id,
				email: invitation.email,
				inviterId: invitation.inviterId,
				organizationId: invitation.organizationId,
				role: invitation.role,
				status: invitation.status,
				createdAt: invitation.createdAt,
				expiresAt: invitation.expiresAt,
				organization: {
					id: organization.id,
					name: organization.name,
					slug: organization.slug,
					logo: organization.logo,
				},
				inviter: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			})
			.from(invitation)
			.innerJoin(organization, eq(invitation.organizationId, organization.id))
			.innerJoin(user, eq(invitation.inviterId, user.id))
			.where(
				and(eq(invitation.email, userEmail), eq(invitation.status, "pending"))
			);

		return createResponse(result as InvitationWithOrg[], null);
	} catch (error) {
		return createResponse(null, error);
	}
}
