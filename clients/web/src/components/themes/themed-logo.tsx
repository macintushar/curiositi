"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo.svg";

export default function ThemedLogo({ height = 32 }: { height?: number }) {
  const { theme } = useTheme();
  return (
    <Image
      src={theme === "dark" ? (logoLight as string) : (logoDark as string)}
      alt="Curiositi"
      height={height}
    />
  );
}
