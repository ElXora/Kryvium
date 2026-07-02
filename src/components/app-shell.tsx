"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, PanelLeft, Plus, ImageIcon } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";

const SLIDE_MS = 300;
const SLIDE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Mobile drawer: separate "mounted" vs "open" so we can play a real
  // slide-out exit animation before unmounting, not just an instant vanish.
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer() {
    setDrawerMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }
  useEffect(() => {
    if (drawerOpen) return;
    if (!drawerMounted) return;
    const t = setTimeout(() => setDrawerMounted(false), SLIDE_MS);
    return () => clearTimeout(t);
  }, [drawerOpen, drawerMounted]);

  return (
    <div className="animate-fade-in relative flex h-screen w-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Desktop sliding panel — width and transform animate together so the
          panel visually slides out to the left rather than snapping. */}
      <div
        className="hidden flex-shrink-0 overflow-hidden md:block"
        style={{ width: collapsed ? 0 : 256, transition: `width ${SLIDE_MS}ms ${SLIDE_EASE}` }}
      >
        <div
          className="h-full w-64"
          style={{
            transform: collapsed ? "translateX(-100%)" : "translateX(0)",
            transition: `transform ${SLIDE_MS}ms ${SLIDE_EASE}`,
          }}
        >
          <Sidebar onToggleCollapse={() => setCollapsed(true)} />
        </div>
      </div>

      {/* Floating rail shown when desktop sidebar is collapsed, so quick
          actions stay reachable without needing to re-expand first. */}
      {collapsed && (
        <div
          className="animate-pop-in absolute left-3 top-3 z-30 hidden flex-col items-center gap-1.5 rounded-[14px] border p-1.5 md:flex"
          style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-soft)" }}
        >
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="press flex h-8 w-8 items-center justify-center rounded-[8px]"
          >
            <PanelLeft size={16} strokeWidth={1.75} />
          </button>
          <div className="my-0.5 h-px w-6" style={{ background: "var(--border)" }} />
          <button
            onClick={() => router.push("/")}
            title="New chat"
            className="press flex h-8 w-8 items-center justify-center rounded-[8px]"
          >
            <Plus size={16} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => router.push("/images")}
            title="Image generation"
            className="press flex h-8 w-8 items-center justify-center rounded-[8px]"
          >
            <ImageIcon size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Mobile drawer */}
      {drawerMounted && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            style={{ opacity: drawerOpen ? 1 : 0, transition: `opacity ${SLIDE_MS}ms ease` }}
            onClick={closeDrawer}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-64 md:hidden sm:w-64"
            style={{
              transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
              transition: `transform ${SLIDE_MS}ms ${SLIDE_EASE}`,
            }}
          >
            <Sidebar onToggleCollapse={closeDrawer} />
          </div>
        </>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex items-center gap-3 border-b px-3 py-2.5 md:hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
        >
          <button
            onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
            className="press relative flex h-8 w-8 items-center justify-center rounded-[8px]"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{
                opacity: drawerOpen ? 0 : 1,
                transform: drawerOpen ? "rotate(90deg) scale(0.7)" : "rotate(0deg) scale(1)",
              }}
            >
              <Menu size={18} strokeWidth={1.75} />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{
                opacity: drawerOpen ? 1 : 0,
                transform: drawerOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.7)",
              }}
            >
              <X size={18} strokeWidth={1.75} />
            </span>
          </button>
          <span className="text-[13.5px] font-semibold tracking-tight">Kryvium</span>
        </div>

        <div className="animate-content-in flex flex-1 flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
