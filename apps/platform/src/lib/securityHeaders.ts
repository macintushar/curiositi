const cspReportOnly = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"font-src 'self' data:",
	"img-src 'self' data: blob: https:",
	"style-src 'self' 'unsafe-inline'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com https://js.sentry-cdn.com",
	"connect-src 'self' https://*.ingest.sentry.io https://accounts.google.com https://www.googleapis.com https://*.googleapis.com https://*.google.com",
	"frame-src 'self' https://accounts.google.com",
	"form-action 'self' https://accounts.google.com",
	"worker-src 'self' blob:",
].join("; ");

export function applySecurityHeaders(response: Response): Response {
	if (process.env.NODE_ENV !== "production") {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set("Content-Security-Policy-Report-Only", cspReportOnly);

	return new Response(response.body, {
		headers,
		status: response.status,
		statusText: response.statusText,
	});
}
