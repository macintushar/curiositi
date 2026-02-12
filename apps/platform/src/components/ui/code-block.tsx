"use client"

import { cn } from "@platform/lib/utils"
import React, { useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { Card } from "./card"
import FileIcon from "../file-icon"

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CodeBlockCard({ language, children }: { language: string; children: React.ReactNode }) {
  return (
    <Card className="p-0 m-0 gap-0">
      <div className="flex flex-row px-2 py-1 items-center gap-1">
        <FileIcon type={language} className="size-5" />
        {language}
      </div>
        {children}
    </Card>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-dark",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }

      const html = await codeToHtml(code, { lang: language, theme })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language, theme])

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className
  )

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <CodeBlockCard language={language}>
      <div
        className={classNames}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        {...props}
      />
    </CodeBlockCard>
  ) : (
  <CodeBlockCard language={language}>
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
        </div>
  </CodeBlockCard>
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

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
  )
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock }
