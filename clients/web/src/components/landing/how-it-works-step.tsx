import React from "react";

type HowItWorksStepProps = {
  stepNumber: number;
  title: string;
  description: string;
};

export function HowItWorksStep({
  stepNumber,
  title,
  description,
}: HowItWorksStepProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        {stepNumber}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
