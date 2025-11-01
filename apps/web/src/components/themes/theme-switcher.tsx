"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Theme } from "@/types";

function ThemedIcon({ theme }: { theme: Theme }) {
  switch (theme) {
    case "dark":
      return IconMoon;
    case "light":
      return IconSun;
    default:
      return IconDeviceLaptop;
  }
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const Icon = ThemedIcon({ theme });
  return <Icon className="size-4" />;
}

export default function ThemeSwitcher({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost";
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
          <ThemeIcon theme={theme as Theme} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <ThemeIcon theme="light" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <ThemeIcon theme="dark" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <ThemeIcon theme="system" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
