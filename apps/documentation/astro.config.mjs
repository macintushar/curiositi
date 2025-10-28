// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://curiositi.xyz',
	integrations: [
		react(),
		sitemap(),
		starlight({
			title: 'Curiositi',
			description: 'Build an AI-powered knowledge workspace that chats over your documents and the web.',
			customCss: ['./src/styles/starlight.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/macintushar/curiositi' },
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/curiositi' }
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Overview', slug: 'overview' },
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'Self-Hosting', slug: 'self-hosting' },
						{ label: 'Deployment', slug: 'deployment' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Architecture', slug: 'architecture' },
						{ label: 'Ingestion', slug: 'ingestion' },
						{ label: 'Search', slug: 'search' },
						{ label: 'LLM Agent', slug: 'llm-agent' },
						{ label: 'API Reference', slug: 'api/readme' },
					],
				},
				{
					label: 'Configuration',
					items: [
						{ label: 'Environment', slug: 'env' },
						{ label: 'Extensibility', slug: 'extensibility' },
						{ label: 'Frontend', slug: 'frontend' },
						{ label: 'Styling', slug: 'styling' },
					],
				},
				{
					label: 'Community',
					items: [
						{ label: 'Contributing', slug: 'contributing' },
						{ label: 'Roadmap', slug: 'roadmap' },
						{ label: 'Troubleshooting', slug: 'troubleshooting' },
					],
				},
			],
		}),
	],
});
