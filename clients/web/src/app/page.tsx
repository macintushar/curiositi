import Image from "next/image";

import {
  IconSearch,
  IconFileText,
  IconGlobe,
  IconBolt,
  IconMessage,
  IconBrandGithubFilled,
} from "@tabler/icons-react";

import { Section } from "@/components/landing/section";
import { FeatureCard } from "@/components/landing/feature-card";
import { HowItWorksStep } from "@/components/landing/how-it-works-step";
import { UseCaseCard } from "@/components/landing/use-case-card";
import { PricingPlanCard } from "@/components/landing/pricing-plan-card";

import { Button } from "@/components/ui/button";

import agentFlowImage from "@/assets/images/agent-flow.png";
import Header from "@/views/landing/header";
import Footer from "@/views/landing/footer";

import { ghURL } from "@/constants/landing-constants";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center scroll-smooth">
      <Header />
      <main className="w-full flex-1 pt-4">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="px-4 md:px-6">
            <div className="animate-fade-up mx-auto max-w-3xl space-y-8 text-center">
              <div className="bg-secondary text-secondary-foreground mb-4 inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
                <span>🎉</span>
                <span>Introducing Curiositi!</span>
                <span>🎉</span>
              </div>
              <h1 className="text-brand font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
                <span className="text-gradient">Get answers</span> from your
                documents and the web
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
                Curiositi combines your documents with live web data to deliver
                context-aware answers using advanced AI and Retrieval-Augmented
                Generation.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="rounded-full px-8">
                  Try Curiositi Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8"
                >
                  See Demo
                </Button>
              </div>
            </div>

            <div className="animate-fade-up animation-delay-200 mt-16 flex justify-center md:mt-24">
              <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border shadow-xl">
                <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-lg bg-gradient-to-br"></div>
                <div className="bg-card relative h-full rounded-lg border-0 p-6">
                  <div className="flex h-full flex-col">
                    <div className="mb-6 flex items-center gap-2">
                      <IconSearch className="text-muted-foreground h-5 w-5" />
                      <div className="bg-background flex-1 rounded-full px-4 py-2 text-sm">
                        How does RAG improve AI responses?
                      </div>
                    </div>
                    <div className="bg-background/50 mb-6 flex-1 rounded-lg p-6">
                      <p className="text-sm leading-relaxed">
                        Retrieval-Augmented Generation (RAG) improves AI
                        responses by combining the power of large language
                        models with specific information retrieval. When you ask
                        a question, RAG first searches through your documents
                        and the web to find relevant information, then uses this
                        context to generate more accurate, up-to-date, and
                        personalized answers.
                      </p>
                      <div className="border-border/40 mt-4 border-t pt-4">
                        <p className="text-muted-foreground text-xs">
                          Sources: Your Documents, Web Search (May 2025)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                      >
                        <IconFileText className="mr-1 h-4 w-4" />
                        Your Documents
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                      >
                        <IconGlobe className="mr-1 h-4 w-4" />
                        Web Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          id="features"
          className="bg-secondary/50"
          title="Powerful AI with context-aware intelligence"
          subtitle="Curiositi combines the best of AI language models with your data and the latest information from the web."
          titlePrefix={
            <div className="bg-primary/10 text-primary mb-2 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium">
              Features
            </div>
          }
        >
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 md:grid-cols-3">
            <FeatureCard
              icon={<IconFileText className="h-6 w-6" />}
              title="Document Intelligence"
              description="Upload your documents, PDFs, spreadsheets, and presentations for instant insights and answers."
              link="#"
            />
            <FeatureCard
              icon={<IconGlobe className="h-6 w-6" />}
              title="Live Web Data"
              description="Access real-time information from the web to complement your documents with the latest data."
              link="#"
            />
            <FeatureCard
              icon={<IconBolt className="h-6 w-6" />}
              title="Hybrid RAG System"
              description="Our advanced Retrieval-Augmented Generation system ensures precise, contextual answers every time."
              link="#"
            />
          </div>
        </Section>

        <Section
          id="how-it-works"
          title="Retrieval-Augmented Generation"
          subtitle="See how Curiositi combines your documents with web data to deliver precise answers."
          titlePrefix={
            <div className="bg-primary/10 text-primary mb-2 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium">
              How It Works
            </div>
          }
        >
          <div className="mx-auto grid max-w-5xl items-center gap-12 py-12 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border shadow-lg">
              <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent"></div>
              <Image
                src={agentFlowImage}
                width={500}
                height={400}
                alt="RAG System Diagram"
                className="h-auto w-full bg-white object-cover p-1"
              />
            </div>
            <div className="space-y-8">
              <HowItWorksStep
                stepNumber={1}
                title="Document Processing"
                description="Upload your documents which are processed, indexed, and stored securely."
              />
              <HowItWorksStep
                stepNumber={2}
                title="Query Understanding"
                description="When you ask a question, our AI understands the context and intent behind it."
              />
              <HowItWorksStep
                stepNumber={3}
                title="Retrieval"
                description="The system retrieves relevant information from your documents and the web."
              />
              <HowItWorksStep
                stepNumber={4}
                title="Generation"
                description="Using the retrieved context, our AI generates precise, tailored answers."
              />
            </div>
          </div>
        </Section>

        <Section
          id="use-cases"
          className="bg-secondary/50"
          title="How people are using Curiositi"
          subtitle="Discover how Curiositi is transforming how people work with information."
          titlePrefix={
            <div className="bg-primary/10 text-primary mb-2 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium">
              Use Cases
            </div>
          }
        >
          <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-3">
            <UseCaseCard
              icon={<IconMessage className="h-6 w-6" />}
              title="Research & Analysis"
              description="Use Curiositi to analyze documents and find connections across multiple sources, saving hours of manual work."
            />
            <UseCaseCard
              icon={<IconMessage className="h-6 w-6" />}
              title="Knowledge Management"
              description="Use Curiositi to make their internal knowledge bases accessible and actionable for all employees."
            />
            <UseCaseCard
              icon={<IconMessage className="h-6 w-6" />}
              title="Study & Research"
              description="Use Curiositi to research topics and generate content backed by accurate, up-to-date information based on their lectures, textbooks, and other documents."
            />
          </div>
        </Section>

        <Section
          id="pricing"
          title="Simple, transparent pricing"
          subtitle="Choose the plan that's right for you and start getting better answers today."
          titlePrefix={
            <div className="bg-primary/10 text-primary mb-2 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium">
              Pricing
            </div>
          }
        >
          <div className="mx-auto flex max-w-5xl justify-center py-12">
            <PricingPlanCard
              title="Free"
              description="Use Curiositi for free by deploying your own instance"
              price=""
              priceSuffix=""
              features={[
                "Upload unlimited documents",
                "Unlimited queries",
                "Unlimited web retrieval",
                "Bring your own models",
                "Own your data, forever",
              ]}
              ctaText="GitHub"
              ctaVariant="default"
              CtaExtra={
                <div className="flex items-center rounded-full bg-white p-0.5">
                  <IconBrandGithubFilled className="text-black" />
                </div>
              }
              ctaHref={ghURL}
              className="w-full md:w-1/3"
              ctaHrefExternal
            />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
