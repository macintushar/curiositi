import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

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
  },
  {
    title: "Hybrid Retrieval (RAG)",
    description:
      "Combine your private corpus with fresh web results for grounded, up-to-date answers.",
    to: "/docs/architecture",
  },
  {
    title: "Secure Auth",
    description:
      "Session + API key management powered by better-auth with scoped provider keys.",
    to: "/docs/api",
  },
  {
    title: "Spaces & Search",
    description:
      "Organize files into spaces; fast vector + keyword search surfaces relevant context.",
    to: "/docs/search",
  },
  {
    title: "Extensible Models",
    description:
      "Bring your own OpenAI, Anthropic, or OpenRouter keys; swap embedding / chat models.",
    to: "/docs/llm-agent",
  },
  {
    title: "Deployment Ready",
    description:
      "Docker + compose + Bun. Run locally or deploy to your infra in minutes.",
    to: "/docs/deployment",
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
      description="Curiositi documentation – build an AI-powered knowledge workspace that chats over your documents and the web."
    >
      <main className="container margin-vert--lg">
        <section className="margin-bottom--xl text--center">
          <Heading as="h1" className="hero__title" style={{ fontSize: "3rem" }}>
            Get answers from your documents <br /> and the web
          </Heading>
          <p className="hero__subtitle" style={{ fontSize: "1.2rem", maxWidth: 820, margin: "0 auto" }}>
            Curiositi is an open-source AI knowledge workspace. Upload, organize, and chat with
            your files using Retrieval-Augmented Generation (RAG) that blends private content with
            live web data.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <Link className="button button--primary button--lg" to="https://curiositi.xyz" rel="noopener noreferrer">
              Try Curiositi Cloud ↗
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/getting-started">
              Self‑Host Docs
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="https://github.com/macintushar/curiositi"
            >
              GitHub Repo ↗
            </Link>
          </div>
        </section>

        <section className="margin-bottom--lg">
          <Heading as="h2">Quick Start</Heading>
          <p>Install dependencies, set environment, run both apps:</p>
          <pre>
            <code>{`# Clone
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
 bun run dev`}</code>
          </pre>
        </section>

        <section className="margin-bottom--lg">
          <Heading as="h2">Key Concepts</Heading>
          <div className="row" style={{ rowGap: "0.75rem" }}>
            {quickLinks.map((l) => (
              <div className="col col--4" key={l.to}>
                <Link to={l.to} className="card" style={{ display: "block", height: "100%" }}>
                  <div className="card__body">
                    <strong>{l.label}</strong>
                    <br />
                    <span style={{ opacity: 0.75 }}>Open {l.label} docs →</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="margin-bottom--lg">
          <Heading as="h2">Features</Heading>
          <div className="row" style={{ rowGap: "1rem" }}>
            {features.map((f) => (
              <div className="col col--4" key={f.title}>
                <Link to={f.to} className="card" style={{ display: "block", height: "100%" }}>
                  <div className="card__header">
                    <h3 style={{ marginBottom: 4 }}>{f.title}</h3>
                  </div>
                  <div className="card__body" style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                    {f.description}
                  </div>
                  <div className="card__footer" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Learn more →
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="margin-bottom--lg">
          <Heading as="h2">Architecture Snapshot</Heading>
          <p style={{ maxWidth: 800 }}>
            Curiositi uses a Bun + Hono API for ingestion, retrieval, and orchestration; Next.js 15
            for the web UI; Postgres + pgvector for embeddings; and a pluggable LLM/embedding layer.
            Retrieval blends vector similarity, space/file filters and optional web search (SearXNG)
            before answer generation.
          </p>
          <p>
            See the <Link to="/docs/architecture">Architecture</Link> and <Link to="/docs/llm-agent">LLM Agent</Link> docs for deeper detail.
          </p>
        </section>

        <section className="margin-bottom--lg">
          <Heading as="h2">Community & Contributing</Heading>
          <p>
            Have ideas or found a bug? Open an issue or PR on {" "}
            <Link to="https://github.com/macintushar/curiositi">GitHub</Link>. Check out the {" "}
            <Link to="/docs/overview">Overview</Link> and {" "}
            <Link to="/docs/contributing">Contributing Guide</Link> to get involved.
          </p>
        </section>
      </main>
    </Layout>
  );
}
