import * as Sentry from "@sentry/tanstackstart-react";

const sentryDsn =
	process.env.VITE_SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
	console.warn("VITE_SENTRY_DSN is not defined. Sentry is not running.");
} else {
	console.log("gg, sentry is running");

	Sentry.init({
		dsn: sentryDsn,
		enableLogs: true,
		sendDefaultPii: true,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 1.0,
		replaysOnErrorSampleRate: 1.0,
	});
}
