"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { useState } from "react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";

function HiddenInput({ className, ...props }: React.ComponentProps<"input">) {
  "use client";
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <input
        type={isVisible ? "text" : "password"}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 h-6 w-6"
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => {
          setIsVisible(!isVisible);
        }}
      >
        {isVisible ? (
          <IconEyeClosed className="h-4 w-4" />
        ) : (
          <IconEye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export { HiddenInput };
