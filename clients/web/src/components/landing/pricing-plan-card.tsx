import { Button } from "@/components/ui/button";
import React from "react";

interface PricingPlanCardProps {
  title: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaVariant?: "default" | "outline";
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary mr-3 h-4 w-4"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export function PricingPlanCard({
  title,
  description,
  price,
  priceSuffix = " /month",
  features,
  isPopular,
  ctaText,
  ctaVariant = "default",
}: PricingPlanCardProps) {
  return (
    <div
      className={`bg-card rounded-lg border p-8 shadow-sm transition-all hover:shadow-md ${isPopular ? "relative shadow-lg hover:shadow-xl" : ""}`}
    >
      {isPopular && (
        <div className="bg-primary text-primary-foreground absolute -top-4 right-0 left-0 mx-auto w-fit rounded-full px-4 py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-medium">{price}</span>
        {price !== "Custom" && (
          <span className="text-muted-foreground">{priceSuffix}</span>
        )}
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant={ctaVariant} className="w-full rounded-full">
        {ctaText}
      </Button>
    </div>
  );
}
