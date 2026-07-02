"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/chat/composer";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { KryviumMark } from "@/components/ui/kryvium-mark";
import { useChatStore } from "@/lib/store/chat-store";

export default function HomePage() {
  const router = useRouter();
  const { createChat, setPendingFirstMessage } = useChatStore();

  async function handleSend(text: string) {
    const chat = await createChat();
    setPendingFirstMessage({ chatId: chat.id, text });
    router.push(`/chat/${chat.id}`);
  }

  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          <KryviumMark size={52} className="animate-float" />
          <h1 className="text-center font-semibold tracking-tight" style={{ fontSize: "clamp(19px, 4vw, 26px)" }}>
            What are we building today?
          </h1>
          <p className="text-center text-[13px] sm:text-[13.5px]" style={{ color: "var(--text-muted)" }}>
            Ask Kryvium anything — code, debug, explain, brainstorm, or just talk.
          </p>
        </div>
        <SuggestionChips onPick={handleSend} />
      </div>
      <Composer onSend={handleSend} isStreaming={false} onStop={() => {}} />
    </AppShell>
  );
}
