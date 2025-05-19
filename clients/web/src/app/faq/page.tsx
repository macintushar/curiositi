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
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl space-y-8 px-4 md:px-6">
            <h1 className="text-2xl font-bold">FAQ</h1>
            <div className="mt-8 space-y-6">
              <Accordion type="multiple">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={faq.question}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
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
