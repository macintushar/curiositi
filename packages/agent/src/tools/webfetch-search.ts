import { tool } from "ai";
import { z } from "zod";

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
				return {
					content: `Blocked: requests to private/internal addresses are not allowed`,
					url,
					title: "",
				};
			}

			try {
				const response = await fetch(url, {
					headers: {
						"User-Agent": "Mozilla/5.0 (compatible; Agent/1.0)",
					},
					redirect: "follow",
				});

				if (!response.ok) {
					return {
						content: `Failed to fetch URL: HTTP ${response.status}`,
						url,
						title: "",
					};
				}

				const html = await response.text();
				const title = extractTitle(html);
				const text = extractTextContent(html);
				const content = text.slice(0, 2000);

				return { content, url, title };
			} catch (error) {
				console.error("Web fetch error:", error);
				return {
					content: error instanceof Error ? error.message : "Unknown error",
					url,
					title: "",
				};
			}
		},
	});
}
