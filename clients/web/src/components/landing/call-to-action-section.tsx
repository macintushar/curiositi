import { Button } from "@/components/ui/button";
import React from "react";

interface CallToActionSectionProps {
  title: string;
  subtitle: string;
  primaryActionText: string;
  primaryActionVariant?: "default" | "secondary";
}

export function CallToActionSection({
  title,
  subtitle,
  primaryActionText,
  primaryActionVariant = "secondary",
}: CallToActionSectionProps) {
  return (
    <section className="bg-primary text-primary-foreground w-full py-20 md:py-32">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
              {title}
            </h2>
            <p className="text-xl opacity-90">{subtitle}</p>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              variant={primaryActionVariant}
              className="rounded-full px-8"
            >
              {primaryActionText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
