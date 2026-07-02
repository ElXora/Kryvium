"use client";

import { useEffect, useState } from "react";
import { LogOut, X } from "lucide-react";

const WAIT_SECONDS = 5;

export function LogoutConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const ready = secondsLeft <= 0;
  const progress = ((WAIT_SECONDS - secondsLeft) / WAIT_SECONDS) * 100;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="animate-pop-in w-full max-w-sm rounded-[18px] border p-6"
        style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "var(--bg-sunken)" }}
            >
              <LogOut size={16} strokeWidth={1.75} style={{ color: "var(--danger)" }} />
            </div>
            <h2 className="text-[15px] font-semibold tracking-tight">Log out of Kryvium?</h2>
          </div>
          <button onClick={onCancel} className="press" aria-label="Cancel">
            <X size={16} />
          </button>
        </div>

        <p className="mb-5 text-[13px]" style={{ color: "var(--text-muted)" }}>
          You&apos;ll need to log back in to access your saved chats. Give it a second — this button unlocks after a short wait so you don&apos;t log out by accident.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="press flex-1 rounded-[10px] border py-2.5 text-[13px] font-medium"
            style={{ borderColor: "var(--border)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready}
            className="press relative flex-1 overflow-hidden rounded-[10px] py-2.5 text-[13px] font-medium transition-opacity disabled:opacity-70"
            style={{ background: "var(--danger)", color: "#fff" }}
          >
            <span
              className="absolute inset-0 origin-left"
              style={{
                background: "rgba(255,255,255,0.18)",
                transform: `scaleX(${progress / 100})`,
                transition: "transform 1s linear",
              }}
            />
            <span className="relative">{ready ? "Log out" : `Wait ${secondsLeft}s…`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
