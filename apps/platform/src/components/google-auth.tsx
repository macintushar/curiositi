import logger from "@curiositi/share/logger";
import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import LastUsedBadge from "./last-used-badge";
import { IconBrandGoogleFilled } from "@tabler/icons-react";

export default function GoogleAuth({ isLastUsed }: { isLastUsed?: boolean }) {
	return (
		<Button
			type="button"
			onClick={async () => {
				const res = await authClient.signIn.social({
					provider: "google",
					callbackURL: "/app",
					newUserCallbackURL: "/onboarding",
				});

				if (res.error) {
					logger.error(res.error.message, res.error);
					toast.error(res.error.message);
				}

				if (res.data?.url) {
					console.log(res.data.url);
				}
			}}
			variant="outline"
			className="flex items-center gap-2 relative"
		>
			<IconBrandGoogleFilled />
			Continue with Google
			{isLastUsed && <LastUsedBadge />}
		</Button>
	);
}
