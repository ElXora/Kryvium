"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { ComposerToggles } from "./composer-toggles";
import { PastedBlock } from "./pasted-block";

const PASTE_THRESHOLD = 400;

export function Composer({
  onSend,
  isStreaming,
  onStop,
}: {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const [text, setText] = useState("");
  const [pastedBlock, setPastedBlock] = useState<string | null>(null);
  const [bounce, setBounce] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted.length > PASTE_THRESHOLD) {
      e.preventDefault();
      setPastedBlock((prev) => (prev ? prev + "\n" + pasted : pasted));
    }
  }

  function handleSend() {
    const combined = [pastedBlock, text].filter(Boolean).join("\n\n");
    if (!combined.trim() || isStreaming) return;
    onSend(combined);
    setText("");
    setPastedBlock(null);
    setBounce((b) => b + 1);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4 xl:max-w-4xl 2xl:max-w-5xl">
      <div
        className="focus-glow rounded-[18px] border p-2 sm:p-2.5"
        style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-soft)" }}
      >
        {pastedBlock && (
          <div className="animate-pop-in">
            <PastedBlock content={pastedBlock} onRemove={() => setPastedBlock(null)} />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder="Message Kryvium…"
          rows={1}
          className="w-full resize-none bg-transparent px-1.5 py-1.5 text-[14px] outline-none sm:text-[14.5px]"
          style={{ color: "var(--text)", maxHeight: 200 }}
        />

        <div className="mt-1 flex items-center justify-between gap-2 px-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            <ModelSelector />
            <ComposerToggles />
          </div>

          {isStreaming ? (
            <button
              onClick={onStop}
              className="press flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--border-strong)", color: "var(--bg)" }}
              title="Stop generating"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              key={bounce}
              onClick={handleSend}
              disabled={!text.trim() && !pastedBlock}
              className="press animate-send-bounce flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
              style={{ background: "var(--border-strong)", color: "var(--bg)" }}
              title="Send message"
            >
              <ArrowUp size={15} strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 px-2 text-center text-[10.5px] sm:text-[11px]" style={{ color: "var(--text-faint)" }}>
        Kryvium can make mistakes. Verify important code before running it.
      </p>
    </div>
  );
}
