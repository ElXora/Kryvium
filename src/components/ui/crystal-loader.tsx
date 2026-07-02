"use client";

/**
 * Branded animated loader: a fractured diamond built from layered SVG
 * shards, matching the Kryvium logo's split black/white motif. No external
 * image assets — pure SVG + CSS animation so it always renders crisply at
 * any size and adapts to light/dark theme automatically via currentColor.
 */
export function CrystalLoader({ size = 64 }: { size?: number }) {
  return (
    <div
      className="crystal-loader"
      style={{ width: size, height: size, color: "var(--text)" }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
        {/* Outer diamond outline */}
        <polygon
          className="crystal-outline"
          points="50,4 90,50 50,96 10,50"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Left half — solid fill, fractures in first */}
        <polygon
          className="crystal-shard crystal-shard-1"
          points="50,4 50,96 10,50"
          fill="currentColor"
        />

        {/* Right half — outline only, fractures in second (matches split logo look) */}
        <polygon
          className="crystal-shard crystal-shard-2"
          points="50,4 90,50 50,96"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Inner core shard — pulses continuously */}
        <polygon
          className="crystal-core"
          points="50,38 62,50 50,62 38,50"
          fill="var(--bg)"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Small floating fragment shards */}
        <rect className="crystal-fragment crystal-fragment-1" x="16" y="24" width="5" height="5" fill="currentColor" transform="rotate(45 18 26)" />
        <rect className="crystal-fragment crystal-fragment-2" x="80" y="70" width="4" height="4" fill="currentColor" transform="rotate(45 82 72)" />
        <rect className="crystal-fragment crystal-fragment-3" x="86" y="30" width="3" height="3" fill="currentColor" transform="rotate(45 87 31)" />
      </svg>
    </div>
  );
}
