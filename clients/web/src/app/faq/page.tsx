import Footer from "@/views/landing/footer";
import Header from "@/views/landing/header";

import { faqs } from "@/constants/faqs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <Header />
      <main className="w-full flex-1 pt-4">
        <section className="w-full py-20 md:py-32">
          <div className="mx-auto max-w-3xl space-y-2 px-4 md:px-6">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-gradient font-serif text-4xl font-medium tracking-tight md:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground text-md max-w-2xl">
                Curiositi combines your documents with live web data to deliver
                context-aware answers using advanced AI and Retrieval-Augmented
                Generation.
              </p>
            </div>
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
