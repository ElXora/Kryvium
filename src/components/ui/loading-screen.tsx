"use client";

import { CrystalLoader } from "./crystal-loader";

/**
 * Full-screen loading state. Uses a custom animated crystal loader —
 * no external image assets required.
 */
export function LoadingScreen({ label = "Loading Kryvium…" }: { label?: string }) {
  return (
    <div
      className="animate-fade-in flex h-screen w-screen flex-col items-center justify-center gap-5"
      style={{ background: "var(--bg)" }}
    >
      <CrystalLoader size={72} />
      <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
        {label}
      </p>
    </div>
  );
}
