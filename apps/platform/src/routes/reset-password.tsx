import ResetPassword from "@platform/pages/reset-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password")({
	component: ResetPassword,
});
