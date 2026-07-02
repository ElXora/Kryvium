"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, ImageIcon, PanelLeftClose } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";
import { ChatListItem } from "./chat-list-item";
import { UserBar } from "./user-bar";
import { KryviumMark } from "@/components/ui/kryvium-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Always renders the full panel — collapse/expand and the mobile drawer
 * slide are handled entirely by AppShell via transform/width transitions,
 * so this component doesn't need to know whether it's "collapsed."
 * onToggleCollapse just means "close/collapse this panel" from the caller's
 * point of view (desktop: collapse to the floating rail, mobile: close drawer).
 */
export function Sidebar({ onToggleCollapse }: { onToggleCollapse: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, loadChats, createChat } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  async function handleNewChat() {
    router.push("/");
  }

  const pinned = chats.filter((c) => c.pinned);
  const recent = chats.filter((c) => !c.pinned);

  return (
    <div
      className="flex h-full w-full flex-col border-r"
      style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
    >
      <div className="flex items-center justify-between px-3 py-3.5">
        <div className="flex items-center gap-2">
          <KryviumMark size={22} className="kryvium-mark-interactive" />
          <span className="text-[14px] font-semibold tracking-tight">Kryvium</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={onToggleCollapse} title="Collapse sidebar" className="press">
            <PanelLeftClose size={17} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      <div className="px-2.5">
        <button
          onClick={handleNewChat}
          className="press lift-hover flex w-full items-center gap-2 rounded-[10px] border px-3 py-2 text-[13px] font-medium"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus size={15} strokeWidth={2} />
          New chat
        </button>
        <button
          onClick={() => router.push("/images")}
          className="press lift-hover mt-1.5 flex w-full items-center gap-2 rounded-[10px] border px-3 py-2 text-[13px] font-medium"
          style={{
            borderColor: pathname === "/images" ? "var(--border-strong)" : "var(--border)",
          }}
        >
          <ImageIcon size={15} strokeWidth={2} />
          Image generation
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-2.5">
        {pinned.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Pinned
            </p>
            <div className="flex flex-col gap-0.5">
              {pinned.map((chat, i) => (
                <div key={chat.id} className="animate-fade-up stagger" style={{ "--i": i } as React.CSSProperties}>
                  <ChatListItem chat={chat} active={pathname === `/chat/${chat.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Recent
            </p>
            <div className="flex flex-col gap-0.5">
              {recent.map((chat, i) => (
                <div key={chat.id} className="animate-fade-up stagger" style={{ "--i": i } as React.CSSProperties}>
                  <ChatListItem chat={chat} active={pathname === `/chat/${chat.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {chats.length === 0 && (
          <p className="px-2 py-4 text-center text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            No chats yet
          </p>
        )}
      </div>

      <div className="facet-divider" />
      <UserBar />
    </div>
  );
}
