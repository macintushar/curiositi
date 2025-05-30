"use client";

import { Logo } from "./logo";

export default function ThemedLogo({ height = 35 }: { height?: number }) {
  return (
    <div className="flex items-start">
      <Logo
        className="fill-emerald-950 dark:fill-emerald-500"
        height={height.toString()}
        width="170"
      />
    </div>
  );
}
