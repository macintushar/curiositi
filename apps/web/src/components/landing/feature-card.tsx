import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import React from "react";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
};

export function FeatureCard({
  icon,
  title,
  description,
  link,
}: FeatureCardProps) {
  return (
    <div className="group hover:bg-background flex flex-col space-y-4 rounded-lg p-6 transition-all">
      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg text-emerald-700">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mt-auto pt-2">
        <Link
          href={link}
          className="text-primary inline-flex items-center text-sm font-medium"
        >
          Learn more <IconArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
