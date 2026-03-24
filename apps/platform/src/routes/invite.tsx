import Invite from "@platform/pages/invite";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const inviteSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/invite")({
	component: InviteComponent,
	validateSearch: inviteSchema,
});

function InviteComponent() {
	const { token } = Route.useSearch();
	return <Invite token={token} />;
}
