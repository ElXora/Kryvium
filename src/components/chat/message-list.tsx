"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./message-bubble";

export function MessageList({
  messages,
  isStreaming,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleScroll() {
      if (!el) return;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distanceFromBottom > 200);
    }
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-3 pb-6 pt-4 sm:px-4 sm:pt-6 xl:max-w-4xl 2xl:max-w-5xl">
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="press animate-scroll-btn absolute bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border shadow-md"
          style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
