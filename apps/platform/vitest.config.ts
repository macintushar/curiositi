import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		include: [
			"src/**/*.test.ts",
			"src/**/*.test.tsx",
			"tests/**/*.test.ts",
			"tests/**/*.test.tsx",
		],
		exclude: ["node_modules", "dist"],
		globals: true,
		setupFiles: ["./tests/setup.ts"],
	},
	resolve: {
		alias: {
			"@platform": resolve(__dirname, "./src"),
		},
	},
});
