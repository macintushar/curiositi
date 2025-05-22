"use client";

import Image from "next/image";

import logo from "@/assets/icon.svg";

export default function ThemedLogo({ height = 28 }: { height?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={logo as string} alt="Curiositi" height={height} />
      <span className="text-lg text-black dark:text-white">curiositi</span>
    </div>
  );
}
