"use client";

import { useState } from "react";
import { Check, Copy, User } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { KryviumMark } from "@/components/ui/kryvium-mark";
import { MessageMarkdown } from "./message-markdown";
import { ShardLoader } from "@/components/ui/shard-loader";

export function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = !isUser && message.content.startsWith("⚠️");

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end gap-2.5 py-2 sm:gap-3">
        <div
          className="max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[14px] leading-relaxed sm:max-w-[78%] sm:px-4 sm:text-[14.5px]"
          style={{ background: "var(--border-strong)", color: "var(--bg)" }}
        >
          {message.content.length > 800 ? (
            <div className="paste-block" style={{ background: "transparent", border: "none", color: "inherit", padding: 0 }}>
              <pre className="whitespace-pre-wrap font-mono text-[13px]">{message.content}</pre>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--surface-hover)" }}
        >
          <User size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    );
  }

  const hasThinking = Boolean(message.thinking);

  return (
    <div className="msg-enter group flex gap-2.5 py-2 sm:gap-3">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--surface-hover)" }}
      >
        <KryviumMark size={16} />
      </div>
      <div className="min-w-0 flex-1">
        {hasThinking && (
          <details className="mb-2 rounded-[10px] border px-3 py-2 animate-fade-up" style={{ borderColor: "var(--border)" }}>
            <summary
              className="cursor-pointer text-[12.5px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Thinking
            </summary>
            <div className="mt-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <MessageMarkdown content={message.thinking ?? ""} />
            </div>
          </details>
        )}

        {message.content.length === 0 && isStreaming ? (
          <ShardLoader />
        ) : (
          <div
            className={`${isStreaming ? "stream-caret" : ""} ${isError ? "animate-error-shake" : ""}`}
            style={isError ? { color: "var(--danger)" } : undefined}
          >
            <MessageMarkdown content={message.content} />
          </div>
        )}

        {!isStreaming && message.content.length > 0 && (
          <button
            onClick={handleCopy}
            className="press mt-1 flex items-center gap-1 rounded px-1.5 py-1 text-[11.5px] opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--text-faint)" }}
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
        )}
      </div>
    </div>
  );
}
