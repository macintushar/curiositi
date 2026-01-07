import Onboarding from "@platform/pages/onboarding";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
	component: Onboarding,
});
