// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { GITHUB_URL } from "./src/constants";

export default defineConfig({
	site: "https://curiositi.xyz",
	vite: {
		plugins: [/** @type {any} */ (tailwindcss())],
	},
	integrations: [
		starlight({
			title: "curiositi",
			disable404Route: true,
			head: [
				{
					tag: "link",
					attrs: {
						rel: "preconnect",
						href: "https://fonts.googleapis.com",
					},
				},
				{
					tag: "link",
					attrs: {
						rel: "preconnect",
						href: "https://fonts.gstatic.com",
						crossorigin: true,
					},
				},
				{
					tag: "link",
					attrs: {
						rel: "stylesheet",
						href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
					},
				},
			],
			customCss: ["./src/styles/global.css"],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: GITHUB_URL,
				},
			],
			sidebar: [
				{
					label: "📖 Home",
					slug: "docs",
				},
				{
					label: "Getting Started",
					autogenerate: { directory: "docs/getting-started" },
				},
				{
					label: "Features",
					autogenerate: { directory: "docs/features" },
				},
				{
					label: "Development",
					autogenerate: { directory: "docs/development" },
				},
				{
					label: "Community",
					autogenerate: { directory: "docs/community" },
				},
				{
					label: "References",
					autogenerate: { directory: "docs/reference" },
				},
			],
		}),
		sitemap(),
		icon(),
	],
});
