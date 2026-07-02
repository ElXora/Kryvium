"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pin, PinOff, Pencil, Trash2, Check, X } from "lucide-react";
import type { Chat } from "@/lib/types";
import { useChatStore } from "@/lib/store/chat-store";

export function ChatListItem({ chat, active }: { chat: Chat; active: boolean }) {
  const router = useRouter();
  const { renameChat, pinChat, deleteChat } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(chat.title);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function commitRename() {
    const trimmed = titleDraft.trim();
    if (trimmed) renameChat(chat.id, trimmed);
    setEditing(false);
  }

  return (
    <div
      className="slide-fade group relative flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[13px] transition-colors"
      style={{ background: active ? "var(--surface-hover)" : "transparent" }}
    >
      {editing ? (
        <div className="flex flex-1 items-center gap-1">
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            className="flex-1 rounded border bg-transparent px-1.5 py-0.5 text-[13px] outline-none"
            style={{ borderColor: "var(--border-strong)" }}
          />
          <button onClick={commitRename}>
            <Check size={13} />
          </button>
          <button onClick={() => setEditing(false)}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => router.push(`/chat/${chat.id}`)}
            className="flex-1 truncate text-left"
            style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
            title={chat.title}
          >
            {chat.pinned && <Pin size={11} className="mr-1 inline" style={{ color: "var(--text-faint)" }} />}
            {chat.title}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-6 w-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: "var(--text-faint)" }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 w-40 rounded-[10px] border p-1 shadow-lg"
                style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}
              >
                <button
                  onClick={() => {
                    pinChat(chat.id, !chat.pinned);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12.5px] hover:opacity-80"
                >
                  {chat.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  {chat.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12.5px] hover:opacity-80"
                >
                  <Pencil size={13} />
                  Rename
                </button>
                <button
                  onClick={() => {
                    deleteChat(chat.id);
                    setMenuOpen(false);
                    if (active) router.push("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12.5px]"
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
