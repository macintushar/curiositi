"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <IconCheck className="size-4 text-green-500" />,
        info: <IconInfoCircle className="size-4 text-blue-500" />,
        warning: <IconAlertTriangle className="size-4 text-yellow-500" />,
        error: <IconX className="size-4 text-red-500" />,
        loading: (
          <IconLoader2 className="size-4 animate-spin text-yellow-500" />
        ),
        close: <IconX className="size-4 text-red-500" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
