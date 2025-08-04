import { Button, type buttonVariants } from "@/components/ui/button";
import { cn, handleCopy } from "@/lib/utils";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";
import TablerIcon from "./tabler-icon";

export default function CopyButton({
  text,
  className,
  variant = "ghost",
  size = "icon",
  iconSize = "size-4",
}: {
  text: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  iconSize?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-md", className)}
      onClick={() => handleCopy(text, setCopied)}
    >
      {copied ? (
        <TablerIcon className={iconSize} Icon={IconCheck} />
      ) : (
        <TablerIcon className={iconSize} Icon={IconCopy} />
      )}
    </Button>
  );
}
