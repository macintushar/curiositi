import Image from "next/image";
import type React from "react";

import logo from "@/assets/icons/icon-lines.svg";

export default function LogoLines({
  children,
  description,
}: {
  children: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src={logo as string}
        alt="Curiositi"
        height={372}
        width={768}
        priority
      />
      <div className="flex flex-col items-center gap-2">
        {children}
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      </div>
    </div>
  );
}
