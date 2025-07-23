import React from "react";

type UseCaseCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function UseCaseCard({ icon, title, description }: UseCaseCardProps) {
  return (
    <div className="group bg-card h-full rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
      <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg text-emerald-700">
        {icon}
      </div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
    </div>
  );
}
