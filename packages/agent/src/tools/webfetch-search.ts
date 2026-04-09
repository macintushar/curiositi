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
			try {
				const response = await fetch(url, {
					headers: {
						"User-Agent": "Mozilla/5.0 (compatible; Agent/1.0)",
					},
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
