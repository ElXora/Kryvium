"use client";

import { FileText, X } from "lucide-react";

export function PastedBlock({
  content,
  onRemove,
}: {
  content: string;
  onRemove: () => void;
}) {
  const lineCount = content.split("\n").length;
  const charCount = content.length;

  return (
    <div
      className="mb-2 flex items-center gap-2.5 rounded-[10px] border px-3 py-2"
      style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
    >
      <FileText size={15} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
      <div className="flex-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
        Pasted content — {lineCount} lines, {charCount} chars
      </div>
      <button
        onClick={onRemove}
        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
