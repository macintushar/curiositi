import type { Tool } from "ai";
import { fileSearchTool } from "./file-search";
import { webSearchTool } from "./web-search";
import { webFetchSearchTool } from "./webfetch-search";
import type { ToolConfig, AIProvider, SearchProvider } from "../types";

export { fileSearchTool, webSearchTool, webFetchSearchTool };

type ToolFactory = (
	organizationId: string,
	provider: AIProvider,
	config?: Record<string, unknown>
) => Tool;

export const toolRegistry: Record<string, ToolFactory> = {
	fileSearch: (organizationId, provider, config) =>
		fileSearchTool(organizationId, provider, config),
	webSearch: (_organizationId, _provider, config) => webSearchTool(config),
	webFetch: () => webFetchSearchTool(),
};

export function createTools(
	organizationId: string,
	provider: AIProvider,
	toolConfigs: ToolConfig[],
	options?: {
		searchProvider?: SearchProvider;
	}
): Record<string, Tool> {
	const tools: Record<string, Tool> = {};

	for (const { name, enabled, config } of toolConfigs) {
		if (!enabled) continue;

		const factory = toolRegistry[name];
		if (!factory) {
			console.warn(`Unknown tool: ${name}`);
			continue;
		}

		if (name === "webSearch" && options?.searchProvider) {
			tools[name] = factory(organizationId, provider, {
				...(config as Record<string, unknown>),
				searchProvider: options.searchProvider,
			});
		} else {
			tools[name] = factory(organizationId, provider, config);
		}
	}

	return tools;
}

export function getAvailableTools(): {
	name: string;
	displayName: string;
	description: string;
}[] {
	return [
		{
			name: "fileSearch",
			displayName: "File Search",
			description:
				"Search through uploaded documents and files to find relevant information.",
		},
		{
			name: "webSearch",
			displayName: "Web Search",
			description:
				"Search the web for current information using Firecrawl or Exa AI.",
		},
		{
			name: "webFetch",
			displayName: "Web Fetch",
			description:
				"Fetch and extract content from a specific URL when you have a direct link.",
		},
	];
}
