import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import "instrument.server.mjs";

export default createServerEntry(
	wrapFetchWithSentry({
		fetch(request: Request) {
			return handler.fetch(request);
		},
	})
);
