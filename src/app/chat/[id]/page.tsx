"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { useChatStore } from "@/lib/store/chat-store";
import { useChatStream } from "@/hooks/use-chat-stream";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { messages, loadMessages, pendingFirstMessage, setPendingFirstMessage } = useChatStore();
  const { sendMessage, isStreaming, stopStreaming } = useChatStream(chatId);
  const firedRef = useRef(false);

  useEffect(() => {
    loadMessages(chatId);
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (
      pendingFirstMessage &&
      pendingFirstMessage.chatId === chatId &&
      !firedRef.current
    ) {
      firedRef.current = true;
      const text = pendingFirstMessage.text;
      setPendingFirstMessage(null);
      sendMessage(text);
    }
  }, [pendingFirstMessage, chatId, sendMessage, setPendingFirstMessage]);

  const chatMessages = messages[chatId] ?? [];

  return (
    <AppShell>
      <MessageList messages={chatMessages} isStreaming={isStreaming} />
      <Composer onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
    </AppShell>
  );
}
