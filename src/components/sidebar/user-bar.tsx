"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useProfileStore } from "@/lib/store/profile-store";

export function UserBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { displayName, user, loadProfile } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initial = (displayName || "G").trim().charAt(0).toUpperCase();

  return (
    <button
      onClick={() => router.push("/settings")}
      className="press flex w-full items-center gap-2.5 px-3 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      style={{
        background: pathname === "/settings" ? "var(--surface-hover)" : "transparent",
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
        style={{ background: "var(--border-strong)", color: "var(--bg)" }}
      >
        {initial}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-[13px] font-medium">{displayName || "Guest"}</p>
        <p className="truncate text-[11.5px]" style={{ color: "var(--text-faint)" }}>
          {user?.email ?? "Not signed in"}
        </p>
      </div>
      <Settings size={15} strokeWidth={1.75} style={{ color: "var(--text-faint)" }} />
    </button>
  );
}
