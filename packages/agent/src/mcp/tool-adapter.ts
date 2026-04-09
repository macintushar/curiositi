import { tool } from "ai";
import { z } from "zod";
import type { McpClient } from "./client";
import type { Tool as McpTool } from "@modelcontextprotocol/sdk/types.js";

function jsonSchemaToZod(
	schema: Record<string, unknown>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const properties = (schema.properties ?? {}) as Record<
		string,
		Record<string, unknown>
	>;
	const required = (schema.required ?? []) as string[];
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const [key, prop] of Object.entries(properties)) {
		const propType = prop.type as string;
		const isRequired = required.includes(key);

		let zodType: z.ZodTypeAny;
		switch (propType) {
			case "string":
				zodType = z.string();
				break;
			case "number":
			case "integer":
				zodType = z.number();
				break;
			case "boolean":
				zodType = z.boolean();
				break;
			case "array":
				zodType = z.array(z.any());
				break;
			case "object":
				zodType = z.record(z.string(), z.any());
				break;
			default:
				zodType = z.any();
		}

		if (!isRequired) {
			zodType = zodType.optional();
		}

		shape[key] = zodType;
	}

	return z.object(shape);
}

export function adaptMcpTool(mcpClient: McpClient, mcpTool: McpTool) {
	const inputSchema = (mcpTool.inputSchema ?? {}) as Record<string, unknown>;
	const zodSchema = jsonSchemaToZod(inputSchema);

	return tool({
		description: mcpTool.description ?? `MCP tool: ${mcpTool.name}`,
		inputSchema: zodSchema,
		execute: async (args: Record<string, unknown>) => {
			try {
				const result = await mcpClient.callTool(mcpTool.name, args);
				return result;
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
	});
}
