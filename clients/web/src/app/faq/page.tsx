import Footer from "@/views/landing/footer";
import Header from "@/views/landing/header";

import { faqs } from "@/constants/faqs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/landing/section";

export default function FAQPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <Header />
      <main className="w-full flex-1 pt-4">
        <Section
          id="features"
          className="bg-secondary/50"
          title="Frequently Asked Questions"
          subtitle="Curiositi combines the best of AI language models with your data and the latest information from the web."
        >
          <div className="mx-auto max-w-3xl space-y-2 px-4 md:px-6">
            <div className="mt-6">
              <Accordion type="multiple">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={faq.question}>
                    <AccordionTrigger className="text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
