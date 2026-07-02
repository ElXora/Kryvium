"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { useEffect, useRef } from "react";
import { CodeBlock } from "./code-block";

export function MessageMarkdown({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
    <div ref={containerRef} className="prose-kryvium text-[14.5px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2.5 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2.5 ml-4 list-decimal space-y-1">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--text)" }}>
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className="border px-2.5 py-1.5 text-left font-medium"
              style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-2.5 py-1.5" style={{ borderColor: "var(--border)" }}>
              {children}
            </td>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (!isBlock) {
              return (
                <code
                  className="rounded px-1.5 py-0.5 text-[13px]"
                  style={{ background: "var(--bg-sunken)", fontFamily: "var(--font-mono)" }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const language = className?.replace("language-", "") ?? "";
            return <CodeBlock language={language}>{String(children).replace(/\n$/, "")}</CodeBlock>;
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
