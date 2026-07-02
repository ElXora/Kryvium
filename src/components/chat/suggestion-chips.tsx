"use client";

import { Code2, Bug, FileCode2, Lightbulb } from "lucide-react";

const SUGGESTIONS = [
  { icon: Code2, text: "Write a binary search function in TypeScript" },
  { icon: Bug, text: "Find the bug in my recursive function" },
  { icon: FileCode2, text: "Build a REST API with Express and Postgres" },
  { icon: Lightbulb, text: "Explain how a hash map works under the hood" },
];

export function SuggestionChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTIONS.map(({ icon: Icon, text }) => (
        <button
          key={text}
          onClick={() => onPick(text)}
          className="lift-hover flex items-start gap-2.5 rounded-[12px] border p-3.5 text-left text-[13px]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <Icon size={15} strokeWidth={1.75} className="mt-0.5 flex-shrink-0" />
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}
