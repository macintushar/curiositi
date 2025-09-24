import { memo, useId, useMemo } from "react";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";

import { IconDownload } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { marked } from "marked";

import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCode } from "./code-block";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "./table";
import { Button } from "./button";
import TablerIcon from "../app/tabler-icon";
import Link from "next/link";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = /language-(\w+)/.exec(className);
  return match?.[1] ?? "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    const { theme } = useTheme();

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
            className,
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    const language = extractLanguage(className);

    return (
      <CodeBlock
        className={className}
        language={language}
        text={children as string}
      >
        <CodeBlockCode
          code={children as string}
          theme={
            theme === "dark" || theme === "system"
              ? "vitesse-dark"
              : "vitesse-light"
          }
          language={language}
        />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>;
  },
  table: function TableComponent({ children }) {
    return (
      <div className="border-border group relative my-2 rounded-lg border">
        <Table>{children}</Table>
        {/* TODO: Add download button */}
        <div className="absolute right-0 bottom-[-15px] opacity-0 group-hover:opacity-100">
          <Button variant="outline" className="w-fit p-1">
            <TablerIcon Icon={IconDownload} />
          </Button>
        </div>
      </div>
    );
  },
  tr: function TrComponent({ children }) {
    return <TableRow>{children}</TableRow>;
  },
  td: function TdComponent({ children }) {
    return <TableCell>{children}</TableCell>;
  },
  th: function ThComponent({ children }) {
    return <TableHead>{children}</TableHead>;
  },
  tbody: function TbodyComponent({ children }) {
    return <TableBody>{children}</TableBody>;
  },
  caption: function CaptionComponent({ children }) {
    return <TableCaption>{children}</TableCaption>;
  },
  p: function PComponent({ children, className }) {
    return <p className={cn("leading-8", className)}>{children}</p>;
  },
  a: function AComponent({ children, href, className }) {
    return (
      <Link href={href ?? ""} className={cn("text-blue-500", className)}>
        {children}
      </Link>
    );
  },
  ul: function UlComponent({ children, className }) {
    return (
      <ul className={cn("list-inside list-disc", className)}>{children}</ul>
    );
  },
  ol: function OlComponent({ children, className }) {
    return (
      <ol className={cn("list-inside list-decimal", className)}>{children}</ol>
    );
  },
  li: function LiComponent({ children, className }) {
    return <li className={className}>{children}</li>;
  },
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };
