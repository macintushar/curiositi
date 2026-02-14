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
		plugins: [tailwindcss()],
	},
	integrations: [
		starlight({
			title: "Curiositi Docs",
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
					label: "Welcome to Curiositi",
					link: "/docs",
				},
			],
		}),
		sitemap(),
		icon(),
	],
});
