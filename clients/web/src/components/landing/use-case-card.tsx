import React from "react";

interface UseCaseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  quote: string;
  author: string;
}

export function UseCaseCard({
  icon,
  title,
  description,
  quote,
  author,
}: UseCaseCardProps) {
  return (
    <div className="group bg-card rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
      <div className="bg-primary/10 text-primary mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="mt-auto border-t pt-4">
        <p className="text-muted-foreground text-sm italic">{quote}</p>
        <p className="mt-2 text-sm font-medium">{author}</p>
      </div>
    </div>
  );
}
