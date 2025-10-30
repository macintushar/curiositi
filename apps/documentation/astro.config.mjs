// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator'

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://curiositi.xyz',

  integrations: [
      react(),
      sitemap(),
      starlightLinksValidator(),
      starlight({
          title: 'Curiositi',
          logo: {
            light: './public/logo.svg',
            dark: './public/logo-dark.svg',
          },
          description: 'Build an AI-powered knowledge workspace that chats over your documents and the web.',
          customCss: ['./src/styles/starlight.css', './src/styles/fonts.css', './src/styles/global.css'],
          social: [
              { icon: 'github', label: 'GitHub', href: 'https://github.com/macintushar/curiositi' },
          ],
          components: {
            Header: './src/components/Header.astro',
          },
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



  vite: {
    plugins: [tailwindcss()],
  },
});
