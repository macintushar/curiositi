import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const ghUrl = "https://github.com/macintushar/curiositi";

const config: Config = {
  title: "Curiositi",
  tagline: "Open AI-native knowledge workspace",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://docs.curiositi.xyz",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "macintushar", // GitHub org/user name.
  projectName: "curiositi", // Repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `${ghUrl}/tree/main/apps/docs/`,
        },

        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: "Curiositi",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "📚 Documentation",
        },
        {
          href: "/docs/contributing",
          label: "🤝 Contribute",
          position: "left",
        },
        {
          href: "/docs/roadmap",
          label: "🚀 Roadmap",
          position: "left",
        },
        {
          href: "https://curiositi.xyz",
          label: "🌐 Cloud",
          position: "right",
        },
        {
          href: ghUrl,
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Overview",
              to: "/docs/overview",
            },
            {
              label: "Getting Started",
              to: "/docs/getting-started",
            },
            {
              label: "Architecture",
              to: "/docs/architecture",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Cloud (SaaS)",
              href: "https://curiositi.xyz",
            },
            {
              label: "GitHub",
              href: ghUrl,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Curiositi.`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [],
};

export default config;
