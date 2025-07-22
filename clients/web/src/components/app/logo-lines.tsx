import type React from "react";

import IconLines from "@/assets/icons/icon-lines";

export default function LogoLines({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <IconLines />
      <div className="absolute inset-x-0 bottom-20 flex flex-col items-center justify-end gap-2 pb-4">
        {children}
        <p className="text-muted-foreground text-center text-sm text-balance">
          {description}
        </p>
      </div>
    </div>
  );
}
