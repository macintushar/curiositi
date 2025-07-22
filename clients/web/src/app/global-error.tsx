"use client";

import { useEffect } from "react";
import Link from "next/link";

import * as Sentry from "@sentry/nextjs";
import {
  IconAlertTriangle,
  IconHelpCircle,
  IconHome,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html>
      <body>
        <div className="bg-background text-foreground flex min-h-screen flex-col">
          <main className="flex flex-1 items-center justify-center py-12 md:py-16 lg:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-2xl space-y-8 text-center">
                <div className="space-y-4">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <IconAlertTriangle className="h-10 w-10" />
                  </div>
                  <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
                    Critical Error
                  </h1>
                  <p className="mx-auto max-w-lg text-xl text-gray-600">
                    A critical error occurred. Please refresh the page or
                    contact support if the problem persists.
                  </p>
                  {error.digest && (
                    <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
                      <p className="mb-1 font-medium">Error ID:</p>
                      <code className="font-mono">{error.digest}</code>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button onClick={reset} size="lg">
                    <IconRefresh className="h-4 w-4" />
                    Try Again
                  </Button>

                  <Link href="/app">
                    <Button variant="outline" size="lg">
                      <IconHome className="h-4 w-4" />
                      Go Home
                    </Button>
                  </Link>
                </div>
                <div>
                  <Button variant="outline" size="lg">
                    <IconHelpCircle className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
