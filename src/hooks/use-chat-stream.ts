"use client";

import { useCallback, useRef, useState } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useProfileStore } from "@/lib/store/profile-store";
import type { ChatMessage } from "@/lib/types";

export function useChatStream(chatId: string) {
  const { addMessage, updateMessage, setChatTitle, messages } = useChatStore();
  const { model, thinkingMode, webSearch } = useSettingsStore();
  const customInstructions = useProfileStore((s) => s.customInstructions);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const isFirstMessage = (messages[chatId]?.length ?? 0) === 0;
      const priorHistory = messages[chatId] ?? [];

      await addMessage(chatId, { role: "user", content: text, model });

      if (isFirstMessage) {
        fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.title) setChatTitle(chatId, data.title);
          })
          .catch(() => {});
      }

      const assistantMessage = await addMessage(chatId, {
        role: "assistant",
        content: "",
        model,
      });

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = [...priorHistory, { role: "user" as const, content: text }].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, model, thinkingMode, webSearch, customInstructions }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({ error: "Something went wrong." }));
          updateMessage(
            chatId,
            assistantMessage.id,
            `⚠️ ${data.error ?? "Something went wrong contacting Kryvium."}`
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let thinkingText = "";
        let finalText = "";
        let inThinking = thinkingMode;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });

          if (thinkingMode) {
            const answerSplit = fullText.split(/\*\*Answer:\*\*/i);
            if (answerSplit.length > 1) {
              thinkingText = answerSplit[0].replace(/\*\*Thinking:\*\*/i, "").trim();
              finalText = answerSplit.slice(1).join("**Answer:**").trim();
              inThinking = false;
            } else {
              thinkingText = fullText.replace(/\*\*Thinking:\*\*/i, "").trim();
              finalText = "";
            }
          } else {
            finalText = fullText;
          }

          updateMessage(
            chatId,
            assistantMessage.id,
            inThinking ? "" : finalText,
            thinkingMode ? thinkingText : undefined
          );
        }

        if (thinkingMode && !finalText) {
          updateMessage(chatId, assistantMessage.id, fullText.trim());
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          updateMessage(chatId, assistantMessage.id, "⚠️ Connection interrupted. Please try again.");
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [chatId, addMessage, updateMessage, setChatTitle, messages, model, thinkingMode, webSearch, customInstructions]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { sendMessage, isStreaming, stopStreaming };
}

export type { ChatMessage };
