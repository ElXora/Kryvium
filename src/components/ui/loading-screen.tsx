"use client";

import { useState } from "react";
import { KryviumMark } from "./kryvium-mark";
import { ShardLoader } from "./shard-loader";

/**
 * Full-screen loading state. Uses /loading/loading.gif if present,
 * otherwise falls back to the shard loader + logo so the app never
 * shows a broken image while that asset hasn't been added yet.
 */
export function LoadingScreen({ label = "Loading Kryvium…" }: { label?: string }) {
  const [gifFailed, setGifFailed] = useState(false);

  return (
    <div
      className="animate-fade-in flex h-screen w-screen flex-col items-center justify-center gap-4"
      style={{ background: "var(--bg)" }}
    >
      {!gifFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/loading/loading.gif"
          alt=""
          className="animate-fade-in h-20 w-20 object-contain"
          onError={() => setGifFailed(true)}
        />
      ) : (
        <KryviumMark size={44} className="animate-float" />
      )}
      <ShardLoader />
      <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
        {label}
      </p>
    </div>
  );
}
