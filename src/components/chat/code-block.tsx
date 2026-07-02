"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  language,
  filename,
  children,
}: {
  language?: string;
  filename?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-block my-2.5">
      <div className="code-block-header">
        <span>{filename || language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <pre>
        <code className={language ? `language-${language}` : undefined}>{children}</code>
      </pre>
    </div>
  );
}
