"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { IconMoon, IconSun, IconSunMoon, type Icon } from "@tabler/icons-react";

export default function ThemeSwitcher({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost";
}) {
  const { theme, setTheme } = useTheme();

  let ThemedIcon: Icon;

  if (theme === "dark") {
    ThemedIcon = IconSun;
  } else if (theme === "light") {
    ThemedIcon = IconMoon;
  } else {
    ThemedIcon = IconSunMoon;
  }

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
      <ThemedIcon className="size-4" />
    </Button>
  );
}
