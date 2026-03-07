import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import "instrument.server.mjs";

import { applySecurityHeaders } from "@platform/lib/securityHeaders";

export default createServerEntry(
	wrapFetchWithSentry({
		async fetch(request: Request) {
			const response = await handler.fetch(request);
			return applySecurityHeaders(response);
		},
	})
);
