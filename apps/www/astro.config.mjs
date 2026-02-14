// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

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
					href: "https://github.com/macintushar/curiositi",
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
