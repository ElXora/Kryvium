"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/store/theme-store";

export function ThemeToggle() {
  const { theme, toggleTheme, hydrate } = useThemeStore();
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <button
      onClick={() => {
        toggleTheme();
        setAnimKey((k) => k + 1);
      }}
      aria-label="Toggle theme"
      title="Toggle light / dark theme"
      className="flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <span key={animKey} className="theme-flip flex">
        {theme === "dark" ? (
          <Moon size={16} strokeWidth={1.75} />
        ) : (
          <Sun size={16} strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
