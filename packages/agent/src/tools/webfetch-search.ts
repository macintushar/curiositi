import { tool } from "ai";
import { z } from "zod";
import logger from "@curiositi/share/logger";

export type WebFetchSearchParams = {
	url: string;
};

type WebFetchResult = {
	content: string;
	url: string;
	title: string;
};

const SSRF_BLOCKED_HOSTNAMES = new Set([
	"localhost",
	"0.0.0.0",
	"::1",
	"[::1]",
]);

const PRIVATE_IP_PATTERNS = [
	/^127\.\d+\.\d+\.\d+$/,
	/^10\.\d+\.\d+\.\d+$/,
	/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
	/^192\.168\.\d+\.\d+$/,
	/^169\.254\.\d+\.\d+$/,
	/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+$/,
	/^fc[0-9a-f]{2}:/i,
	/^fd[0-9a-f]{2}:/i,
	/^fe80:/i,
];

function isBlockedHost(hostname: string): boolean {
	const lower = hostname.toLowerCase();
	if (SSRF_BLOCKED_HOSTNAMES.has(lower)) return true;
	return PRIVATE_IP_PATTERNS.some((p) => p.test(lower));
}

function extractTextContent(html: string): string {
	const text = html
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	return text;
}

function extractTitle(html: string): string {
	const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	return match?.[1]?.trim() ?? "";
}

const MAX_BODY_BYTES = 1_048_576;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

export function webFetchSearchTool() {
	return tool({
		description: `Fetch and extract content from a specific URL.
Use this when you have a direct URL and need to read its content.
Returns the main text content and title of the page.`,
		inputSchema: z.object({
			url: z
				.string()
				.url()
				.describe("The URL to fetch and extract content from"),
		}),

		execute: async ({ url }: WebFetchSearchParams): Promise<WebFetchResult> => {
			let parsed: URL;
			try {
				parsed = new URL(url);
			} catch {
				return { content: "Invalid URL", url, title: "" };
			}

			if (!["http:", "https:"].includes(parsed.protocol)) {
				return {
					content: `Blocked: only http/https URLs are allowed`,
					url,
					title: "",
				};
			}

			if (isBlockedHost(parsed.hostname)) {
				logger.error("Blocked URL", { url });
				return {
					content: `Blocked: requests to private/internal addresses are not allowed`,
					url,
					title: "",
				};
			}

			try {
				let currentUrl = url;
				let redirectsLeft = MAX_REDIRECTS;

				while (true) {
					const controller = new AbortController();
					const timeoutId = setTimeout(
						() => controller.abort(),
						FETCH_TIMEOUT_MS
					);

					let response: Response;
					try {
						logger.info("Fetching URL", { url: currentUrl });
						response = await fetch(currentUrl, {
							headers: {
								"User-Agent": "Mozilla/5.0 (compatible; Agent/1.0)",
							},
							redirect: "manual",
							signal: controller.signal,
						});
					} finally {
						clearTimeout(timeoutId);
					}

					if (
						response.status >= 300 &&
						response.status < 400 &&
						response.headers.get("location")
					) {
						if (redirectsLeft <= 0) {
							return {
								content: "Too many redirects",
								url,
								title: "",
							};
						}
						redirectsLeft--;

						const location = response.headers.get("location") ?? "";
						let nextUrl: URL;
						try {
							nextUrl = new URL(location, currentUrl);
						} catch {
							return { content: "Invalid redirect URL", url, title: "" };
						}

						if (!["http:", "https:"].includes(nextUrl.protocol)) {
							return {
								content: "Blocked: redirect to non-http/https URL",
								url,
								title: "",
							};
						}

						if (isBlockedHost(nextUrl.hostname)) {
							logger.error("Blocked redirect URL", { url: nextUrl.href });
							return {
								content: `Blocked: redirect to private/internal address`,
								url,
								title: "",
							};
						}

						currentUrl = nextUrl.href;
						continue;
					}

					if (!response.ok) {
						return {
							content: `Failed to fetch URL: HTTP ${response.status}`,
							url,
							title: "",
						};
					}

					const contentType = response.headers.get("content-type") ?? "";
					if (
						!contentType.includes("text/html") &&
						!contentType.includes("text/plain")
					) {
						return {
							content: `Unsupported content type: ${contentType}`,
							url,
							title: "",
						};
					}

					const reader = response.body?.getReader();
					if (!reader) {
						return { content: "Failed to read response body", url, title: "" };
					}

					const chunks: Uint8Array[] = [];
					let totalBytes = 0;
					while (true) {
						const { done, value } = await reader.read();
						if (done || !value) break;
						const remaining = MAX_BODY_BYTES - totalBytes;
						if (value.byteLength >= remaining) {
							chunks.push(value.slice(0, remaining));
							await reader.cancel();
							break;
						}
						chunks.push(value);
						totalBytes += value.byteLength;
					}

					const combinedBuffer = new Uint8Array(
						chunks.reduce((acc, c) => acc + c.byteLength, 0)
					);
					let offset = 0;
					for (const chunk of chunks) {
						combinedBuffer.set(chunk, offset);
						offset += chunk.byteLength;
					}
					const decodedHtml = new TextDecoder().decode(combinedBuffer);

					const title = extractTitle(decodedHtml);
					const text = extractTextContent(decodedHtml);
					const content = text.slice(0, 2000);

					return { content, url, title };
				}
			} catch (error) {
				logger.error("Web fetch error", error);
				return {
					content: error instanceof Error ? error.message : "Unknown error",
					url,
					title: "",
				};
			}
		},
	});
}
