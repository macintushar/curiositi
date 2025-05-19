"use client";

import { Button } from "@/components/ui/button";
import { SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="outline"
      className="rounded-full"
    >
      <SunMoonIcon />
    </Button>
  );
}
