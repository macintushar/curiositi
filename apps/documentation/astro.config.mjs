// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import config from "./config.mjs";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: config.url,

  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },

  integrations: [
    react(),
    starlight({
      title: "Curiositi",
      lastUpdated: true,
      titleDelimiter: "|",
      expressiveCode: {
        themes: ["github-light", "github-dark"],
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: config.github,
        },
      ],
      markdown: {
        headingLinks: false,
      },
      customCss: ["./src/styles/custom.css"],
      logo: {
        light: "./public/logo.svg",
        dark: "./public/logo-dark.svg",
        replacesTitle: true,
      },
      components: {
        Head: "./src/components/Head.astro",
        Header: "./src/components/Header.astro",
        Hero: "./src/components/Hero.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        Footer: "./src/components/Footer.astro",
        Search: "./src/components/Search.astro",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "overview" },
            { label: "Getting Started", slug: "getting-started" },
            { label: "Self-Hosting", slug: "self-hosting" },
            { label: "Deployment", slug: "deployment" },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            { label: "Architecture", slug: "architecture" },
            { label: "Ingestion", slug: "ingestion" },
            { label: "Search", slug: "search" },
            { label: "LLM Agent", slug: "llm-agent" },
            { label: "API Reference", slug: "api/readme" },
          ],
        },
        {
          label: "Configuration",
          items: [
            { label: "Environment", slug: "env" },
            { label: "Extensibility", slug: "extensibility" },
            { label: "Frontend", slug: "frontend" },
            { label: "Styling", slug: "styling" },
          ],
        },
        {
          label: "Community",
          items: [
            { label: "Contributing", slug: "contributing" },
            { label: "Roadmap", slug: "roadmap" },
            { label: "Troubleshooting", slug: "troubleshooting" },
          ],
        },
      ],
    }),
    sitemap(),
  ],
});
