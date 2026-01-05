import { Button } from "@curiositi/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<Button
			onClick={() => {
				throw new Error("Sentry Test Error");
			}}
		>
			Break Everything
		</Button>
	);
}
