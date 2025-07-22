import Link from "next/link";

import { IconError404, IconHome, IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

import Header from "@/views/landing/header";
import Footer from "@/views/landing/footer";

import notFoundImage from "@/assets/images/404.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CTAButton from "@/views/landing/cta-button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="animate-fade-up mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-4">
              <Avatar className="mx-auto size-32">
                <AvatarImage src={notFoundImage.src} />
                <AvatarFallback>
                  <IconError404 className="size-10" />
                </AvatarFallback>
              </Avatar>

              <h1 className="text-gradient font-serif text-6xl font-medium tracking-tight md:text-7xl">
                404
              </h1>
              <h2 className="font-serif text-2xl font-medium tracking-tight italic md:text-3xl">
                Oops! That page has wandered off.
              </h2>
              <p className="text-muted-foreground mx-auto max-w-lg">
                We looked everywhere, but we couldn&apos;t find what you&apos;re
                after. Maybe try heading back to the homepage?
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/">
                  <Button size="lg" className="gap-2 rounded-full px-8">
                    <IconHome className="h-4 w-4" />
                    Go Home
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full px-8"
                  >
                    <IconSearch className="h-4 w-4" />
                    Search FAQ
                  </Button>
                </Link>
              </div>
              <CTAButton />
            </div>
            <div className="border-border/40 border-t pt-8">
              <p className="text-muted-foreground mb-4 text-sm">
                Looking for something specific? Try these popular pages:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/#features">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Features
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Pricing
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    FAQ
                  </Button>
                </Link>
                <Link href="/#how-it-works">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
