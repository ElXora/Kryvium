"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Zap, Shield } from "lucide-react";
import { MODEL_OPTIONS } from "@/lib/types";
import { useSettingsStore } from "@/lib/store/settings-store";

export function ModelSelector() {
  const { model, setModel } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0];

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 256;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
    if (left < 8) left = 8;
    setCoords({ left, bottom: window.innerHeight - rect.top + 8, width: menuWidth });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();

    function handleOutside(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="press flex items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-2.5 py-1.5 text-xs font-medium transition-colors"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      >
        {current.id === "kryvium-turbo" ? (
          <Zap size={13} strokeWidth={2} />
        ) : (
          <Shield size={13} strokeWidth={2} />
        )}
        {current.label}
        <ChevronDown
          size={13}
          strokeWidth={2}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="animate-menu-in fixed z-[70] rounded-[12px] border p-1.5"
            style={{
              left: coords.left,
              bottom: coords.bottom,
              width: coords.width,
              borderColor: "var(--border)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-pop)",
              transformOrigin: "bottom left",
            }}
          >
            {MODEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setModel(opt.id);
                  setOpen(false);
                }}
                className="press flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors"
                style={{
                  background: opt.id === model ? "var(--surface-hover)" : "transparent",
                }}
              >
                <span className="mt-0.5">
                  {opt.id === "kryvium-turbo" ? (
                    <Zap size={14} strokeWidth={2} />
                  ) : (
                    <Shield size={14} strokeWidth={2} />
                  )}
                </span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                    {opt.label}
                  </span>
                  <span className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>
                    {opt.description}
                  </span>
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
