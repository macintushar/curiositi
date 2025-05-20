import React from "react";

interface SectionProps {
  id?: string;
  className?: string;
  title: string;
  subtitle: string;
  titlePrefix?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({
  id,
  className,
  title,
  subtitle,
  titlePrefix,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`w-full py-20 md:py-32 ${className}`}>
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="max-w-3xl space-y-2">
            {titlePrefix}
            <h2 className="font-serif text-3xl font-medium tracking-tight text-emerald-700 md:text-4xl">
              {title}
            </h2>
            <p className="text-muted-foreground text-xl">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
