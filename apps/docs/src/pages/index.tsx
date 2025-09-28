import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import { Button } from "../components/button";
import {
  IconFileText,
  IconNetwork,
  IconLock,
  IconSearch,
  IconBrain,
  IconBrandDocker,
  IconExternalLink,
  IconBrandGithub,
} from "@tabler/icons-react";

// Docs landing page inspired by the main web app marketing page
// Keep it lightweight (no custom components) but provide:
// - Hero tagline
// - Quick start commands
// - Key concepts / navigation shortcuts
// - Feature highlights mapping to docs sections
// - Links to GitHub and community

const features = [
  {
    title: "Document Intelligence",
    description:
      "Upload PDFs, Office docs, text & more. We extract, chunk and index for semantic retrieval.",
    to: "/docs/ingestion",
    icon: <IconFileText size={24} />,
  },
  {
    title: "Hybrid Retrieval (RAG)",
    description:
      "Combine your private corpus with fresh web results for grounded, up-to-date answers.",
    to: "/docs/architecture",
    icon: <IconNetwork size={24} />,
  },
  {
    title: "Secure Auth",
    description:
      "Session + API key management powered by better-auth with scoped provider keys.",
    to: "/docs/api",
    icon: <IconLock size={24} />,
  },
  {
    title: "Spaces & Search",
    description:
      "Organize files into spaces; fast vector + keyword search surfaces relevant context.",
    to: "/docs/search",
    icon: <IconSearch size={24} />,
  },
  {
    title: "Extensible Models",
    description:
      "Bring your own OpenAI, Anthropic, or OpenRouter keys; swap embedding / chat models.",
    to: "/docs/llm-agent",
    icon: <IconBrain size={24} />,
  },
  {
    title: "Deployment Ready",
    description:
      "Docker + compose + Bun. Run locally or deploy to your infra in minutes.",
    to: "/docs/deployment",
    icon: <IconBrandDocker size={24} />,
  },
];

const quickLinks = [
  { label: "Getting Started", to: "/docs/getting-started" },
  { label: "Architecture", to: "/docs/architecture" },
  { label: "API Reference", to: "/docs/api" },
  { label: "Ingestion", to: "/docs/ingestion" },
  { label: "Styling", to: "/docs/styling" },
  { label: "Troubleshooting", to: "/docs/troubleshooting" },
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Docs`}
      description="Curiositi documentation - build an AI-powered knowledge workspace that chats over your documents and the web."
    >
      <main className="container margin-vert--lg">
        <section className="hero-section margin-bottom--xl text--center">
          <div className="hero-content">
            <div className="hero-badge">
              <span>📚</span>
              <span>Documentation</span>
              <span>📚</span>
            </div>
            <Heading as="h1" className="hero-title">
              <span className="text-gradient">Get answers</span> from your
              documents <br /> and the web
            </Heading>
            <p className="hero-subtitle">
              Curiositi is an open-source AI knowledge workspace. Upload,
              organize, and chat with your files using Retrieval-Augmented
              Generation (RAG) that blends private content with live web data.
            </p>
            <div className="hero-buttons">
              <Link
                className="button button--primary button--lg hero-button-primary"
                to="https://curiositi.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Try Curiositi Cloud</span>
                <IconExternalLink size={16} />
              </Link>
              <Link
                className="button button--secondary button--lg hero-button-secondary"
                to="/docs/getting-started"
              >
                Self‑Host Docs
              </Link>
              <Link
                className="button button--outline button--lg hero-button-outline"
                to="https://github.com/macintushar/curiositi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub size={16} />
                GitHub Repo
              </Link>
            </div>
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-200">
          <div className="section-header">
            <div className="section-badge">Quick Start</div>
            <Heading as="h2" className="section-title">
              Get up and running
            </Heading>
            <p className="section-subtitle">
              Install dependencies, set environment, run both apps:
            </p>
          </div>
          <div className="code-block-wrapper">
            <pre>
              <code>
                {`# Clone
git clone https://github.com/macintushar/curiositi
cd curiositi

# Install deps
bun install

# Copy env templates
cp ./apps/server/.env.example ./apps/server/.env
cp ./apps/web/.env.example ./apps/web/.env

# Run migrations (requires Postgres + pgvector)
bun run db:migrate

# Start dev (server + web)
bun run dev`}
              </code>
            </pre>
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-200">
          <div className="demo-section">
            <div className="demo-card">
              <div className="demo-header">
                <IconSearch size={20} />
                <div className="demo-input">
                  How does RAG improve AI responses?
                </div>
              </div>
              <div className="demo-content">
                <p>
                  Retrieval-Augmented Generation (RAG) improves AI responses by
                  combining the power of large language models with specific
                  information retrieval. When you ask a question, RAG first
                  searches through your documents and the web to find relevant
                  information, then uses this context to generate more accurate,
                  up-to-date, and personalized answers.
                </p>
                <div className="demo-sources">
                  <p>Sources: Your Documents, Web Search (May 2025)</p>
                </div>
              </div>
              <div className="demo-tags">
                <div className="demo-tag">
                  <IconFileText size={16} />
                  Your Documents
                </div>
                <div className="demo-tag">
                  <IconNetwork size={16} />
                  Web Data
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-400">
          <div className="section-header">
            <div className="section-badge">Key Concepts</div>
            <Heading as="h2" className="section-title">
              Essential documentation
            </Heading>
            <p className="section-subtitle">
              Essential documentation to get you started
            </p>
          </div>
          <div className="row" style={{ rowGap: "1rem" }}>
            {quickLinks.map((l) => (
              <div className="col col--4" key={l.to}>
                <Link to={l.to} className="quick-link-card">
                  <div className="quick-link-title">{l.label}</div>
                  <div className="quick-link-subtitle">Open {l.label} docs</div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-400">
          <div className="section-header">
            <div className="section-badge">Features</div>
            <Heading as="h2" className="section-title">
              Powerful AI capabilities
            </Heading>
            <p className="section-subtitle">
              Powerful AI capabilities for your knowledge workspace
            </p>
          </div>
          <div className="row" style={{ rowGap: "1.5rem" }}>
            {features.map((f) => (
              <div className="col col--4" key={f.title}>
                <Link to={f.to} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-card-header">
                    <h3 className="feature-card-title">{f.title}</h3>
                  </div>
                  <div className="feature-card-description">
                    {f.description}
                  </div>
                  <div className="feature-card-footer">Learn more</div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-400">
          <Heading as="h2" className="section-title">
            Architecture Snapshot
          </Heading>
          <div className="architecture-content">
            <p className="section-subtitle">
              Curiositi uses a Bun + Hono API for ingestion, retrieval, and
              orchestration; Next.js 15 for the web UI; Postgres + pgvector for
              embeddings; and a pluggable LLM/embedding layer. Retrieval blends
              vector similarity, space/file filters and optional web search
              (SearXNG) before answer generation.
            </p>
            <p>
              See the <Link to="/docs/architecture">Architecture</Link> and{" "}
              <Link to="/docs/llm-agent">LLM Agent</Link> docs for deeper
              detail.
            </p>
          </div>
        </section>

        <section className="margin-bottom--lg animate-fade-up animation-delay-400">
          <Heading as="h2" className="section-title">
            Community & Contributing
          </Heading>
          <div className="community-content">
            <p className="section-subtitle">
              Have ideas or found a bug? Open an issue or PR on{" "}
              <Link to="https://github.com/macintushar/curiositi">GitHub</Link>.
              Check out the <Link to="/docs/overview">Overview</Link> and{" "}
              <Link to="/docs/contributing">Contributing Guide</Link> to get
              involved.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
