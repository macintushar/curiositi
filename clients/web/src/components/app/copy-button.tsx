import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";

export default function CopyButton({
  text,
  className,
  variant = "ghost",
  size = "icon",
}: {
  text: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-md", className)}
      onClick={handleCopy}
    >
      {copied ? (
        <IconCheck className="size-4" />
      ) : (
        <IconCopy className="size-4" />
      )}
    </Button>
  );
}
