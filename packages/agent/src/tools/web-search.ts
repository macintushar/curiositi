import { tool } from "ai";
import { z } from "zod";
import type { WebSearchToolConfig } from "../types";
import logger from "@curiositi/share/logger";

export type WebSearchParams = {
	query: string;
};

type SearchResult = {
	title: string;
	url: string;
	snippet: string;
};

type FirecrawlResponse = {
	data?: Array<{
		url: string;
		metadata?: {
			title?: string;
			description?: string;
		};
		snippet?: string;
	}>;
};

function mapFirecrawlResults(data: FirecrawlResponse): SearchResult[] {
	return (data.data ?? []).map((r) => ({
		title: r.metadata?.title ?? "",
		url: r.url,
		snippet: r.metadata?.description ?? r.snippet ?? "",
	}));
}

function filterByDomains(
	results: SearchResult[],
	includeDomains: string[],
	excludeDomains: string[]
) {
	const normalizedIncludes = includeDomains
		.map((domain) => domain.trim().toLowerCase())
		.filter(Boolean);
	const normalizedExcludes = excludeDomains
		.map((domain) => domain.trim().toLowerCase())
		.filter(Boolean);

	return results.filter((result) => {
		let hostname = "";
		try {
			hostname = new URL(result.url).hostname.toLowerCase();
		} catch {
			return false;
		}

		const isIncluded =
			normalizedIncludes.length === 0 ||
			normalizedIncludes.some(
				(includeDomain) =>
					hostname === includeDomain || hostname.endsWith(`.${includeDomain}`)
			);
		if (!isIncluded) {
			return false;
		}

		const isExcluded = normalizedExcludes.some(
			(excludeDomain) =>
				hostname === excludeDomain || hostname.endsWith(`.${excludeDomain}`)
		);
		return !isExcluded;
	});
}

export function webSearchTool(config: WebSearchToolConfig = {}) {
	const { maxResults = 5, includeDomains = [], excludeDomains = [] } = config;

	return tool({
		description: `Search the web for current information.
Use this when you need up-to-date information or when the answer isn't in the uploaded files.
Returns relevant search results with titles, snippets, and URLs.`,
		inputSchema: z.object({
			query: z.string().describe("The search query"),
		}),

		execute: async ({ query }: WebSearchParams) => {
			try {
				const apiKey = process.env.FIRECRAWL_API_KEY;
				if (!apiKey) {
					return {
						error: "FIRECRAWL_API_KEY not configured",
						results: [],
						query,
					};
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 10_000);
				let response: Response;
				try {
					response = await fetch("https://api.firecrawl.dev/v1/search", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${apiKey}`,
						},
						body: JSON.stringify({
							query,
							limit: maxResults,
						}),
						signal: controller.signal,
					});
				} finally {
					clearTimeout(timeoutId);
				}

				if (!response.ok) {
					return {
						error: `Firecrawl API error: ${response.status}`,
						results: [],
						query,
					};
				}

				const data = (await response.json()) as FirecrawlResponse;
				const results = filterByDomains(
					mapFirecrawlResults(data),
					includeDomains,
					excludeDomains
				);

				return { results: results.slice(0, maxResults), query };
			} catch (error) {
				logger.error("Web search error", error);
				return {
					error: error instanceof Error ? error.message : "Unknown error",
					results: [],
					query,
				};
			}
		},
	});
}
