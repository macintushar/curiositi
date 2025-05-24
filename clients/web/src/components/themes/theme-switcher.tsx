"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost";
}) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant={variant}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-full",
        className,
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <SunMoonIcon className="size-5" />
    </Button>
  );
}
