"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import CopyButton from "../app/copy-button";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
  language?: string;
  text?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({
  children,
  className,
  language,
  text,
  ...props
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose my-2 flex w-full flex-col overflow-clip border",
        "border-border text-card-foreground rounded-xl",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-2 py-1 text-xs">
        <p className="text-muted-foreground font-mono">{language ?? "Code"}</p>
        <CopyButton
          className="size-5 rounded-sm p-1"
          iconSize="size-3"
          variant="outline"
          text={text?.trim() ?? "No code provided to copy"}
        />
      </div>
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });
      setHighlightedHtml(html);
    }
    void highlight();
  }, [code, language, theme]);

  const classNames = cn(
    "w-full overflow-x-auto text-xs [&>pre]:px-4 [&>pre]:py-4",
    className,
  );

  // SSR fallback: render plain code if not hydrated yet

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
