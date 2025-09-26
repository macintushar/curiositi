import { Button } from "@/components/ui/button";
import { IconCheck, type Icon } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

type PricingPlanCardProps = {
  title: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  CtaExtra?: React.ReactNode;
  CtaIcon?: Icon;
  ctaVariant?: "default" | "outline";
  ctaHref?: string;
  ctaHrefExternal?: boolean;
  className?: string;
};

export function PricingPlanCard({
  title,
  description,
  price,
  priceSuffix = " /month",
  features,
  isPopular,
  ctaText,
  CtaExtra,
  CtaIcon,
  ctaVariant = "default",
  ctaHref,
  ctaHrefExternal = false,
  className,
}: PricingPlanCardProps) {
  return (
    <Card
      className={cn(
        className,
        isPopular && "relative shadow-lg hover:shadow-xl",
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {price && (
          <div className="mb-6">
            <span className="text-4xl font-medium">{price}</span>
            {price !== "Custom" && (
              <span className="text-muted-foreground">{priceSuffix}</span>
            )}
          </div>
        )}
        {isPopular && (
          <div className="bg-primary text-primary-foreground absolute -top-4 right-0 left-0 mx-auto w-fit rounded-full px-4 py-1 text-sm font-medium">
            Most Popular
          </div>
        )}
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <IconCheck className="text-brand size-4" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={ctaVariant}
          className={`w-full rounded-full ${ctaHrefExternal ? "cursor-pointer" : ""}`}
          asChild
        >
          <Link
            href={ctaHref ?? "#"}
            target={ctaHrefExternal ? "_blank" : "_self"}
            rel={ctaHrefExternal ? "noopener noreferrer" : undefined}
            className="w-full"
          >
            {CtaIcon && <CtaIcon className="h-4 w-4" />}
            {CtaExtra && CtaExtra}
            {ctaText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
