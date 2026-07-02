"use client";

import { useState } from "react";
import { BrainCircuit, Globe } from "lucide-react";
import { useSettingsStore } from "@/lib/store/settings-store";

export function ComposerToggles() {
  const { thinkingMode, webSearch, toggleThinking, toggleWebSearch } = useSettingsStore();
  const [thinkPop, setThinkPop] = useState(0);
  const [searchPop, setSearchPop] = useState(0);

  return (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      <button
        key={`think-${thinkPop}`}
        onClick={() => {
          toggleThinking();
          setThinkPop((p) => p + 1);
        }}
        title="Toggle thinking mode"
        className="press animate-toggle-pop flex items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-2.5 py-1.5 text-xs font-medium transition-colors"
        style={{
          borderColor: thinkingMode ? "var(--border-strong)" : "var(--border)",
          background: thinkingMode ? "var(--surface-hover)" : "transparent",
          color: "var(--text)",
        }}
      >
        <BrainCircuit size={13} strokeWidth={2} />
        Thinking
      </button>
      <button
        key={`search-${searchPop}`}
        onClick={() => {
          toggleWebSearch();
          setSearchPop((p) => p + 1);
        }}
        title="Toggle deep web search"
        className="press animate-toggle-pop flex items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-2.5 py-1.5 text-xs font-medium transition-colors"
        style={{
          borderColor: webSearch ? "var(--border-strong)" : "var(--border)",
          background: webSearch ? "var(--surface-hover)" : "transparent",
          color: "var(--text)",
        }}
      >
        <Globe size={13} strokeWidth={2} />
        Search
      </button>
    </div>
  );
}
