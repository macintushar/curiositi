import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@platform/lib/auth";

export const orgsMiddleware = createMiddleware().server(async ({ next }) => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (!session) {
		throw redirect({ to: "/sign-in" });
	}

	const userOrgs = await auth.api.listOrganizations({ headers });

	if (userOrgs.length === 0) {
		throw redirect({ to: "/onboarding" });
	}

	if (!session.session.activeOrganizationId) {
		await auth.api.setActiveOrganization({
			headers,
			body: {
				organizationId: userOrgs[0].id,
			},
		});
	}

	return await next();
});
