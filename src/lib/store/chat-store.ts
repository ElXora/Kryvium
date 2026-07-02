"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Chat, ChatMessage, ModelId } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";

const LOCAL_CHATS_KEY = "kryvium-local-chats";
const LOCAL_MSGS_KEY = "kryvium-local-messages";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

interface ChatState {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  pendingFirstMessage: { chatId: string; text: string } | null;
  setPendingFirstMessage: (val: { chatId: string; text: string } | null) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  createChat: () => Promise<Chat>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  pinChat: (chatId: string, pinned: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "created_at" | "chat_id">) => Promise<ChatMessage>;
  updateMessage: (chatId: string, messageId: string, content: string, thinking?: string) => void;
  setChatTitle: (chatId: string, title: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  loading: false,
  pendingFirstMessage: null,
  setPendingFirstMessage: (val) => set({ pendingFirstMessage: val }),

  loadChats: async () => {
    set({ loading: true });
    if (!isSupabaseConfigured) {
      const local = readLocal<Chat[]>(LOCAL_CHATS_KEY, []);
      set({ chats: local.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)), loading: false });
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Kryvium: failed to load chats from Supabase — falling back to local storage.", error);
      const local = readLocal<Chat[]>(LOCAL_CHATS_KEY, []);
      set({ chats: local.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)), loading: false });
      return;
    }

    set({ chats: (data as Chat[]) ?? [], loading: false });
  },

  loadMessages: async (chatId: string) => {
    if (!isSupabaseConfigured) {
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      set((s) => ({ messages: { ...s.messages, [chatId]: all[chatId] ?? [] } }));
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      set((s) => ({ messages: { ...s.messages, [chatId]: all[chatId] ?? [] } }));
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Kryvium: failed to load messages from Supabase.", error);
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      set((s) => ({ messages: { ...s.messages, [chatId]: all[chatId] ?? [] } }));
      return;
    }

    set((s) => ({ messages: { ...s.messages, [chatId]: (data as ChatMessage[]) ?? [] } }));
  },

  createChat: async () => {
    const now = new Date().toISOString();
    const chat: Chat = {
      id: nanoid(),
      user_id: "local",
      title: "New chat",
      pinned: false,
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      const local = readLocal<Chat[]>(LOCAL_CHATS_KEY, []);
      const updated = [chat, ...local];
      writeLocal(LOCAL_CHATS_KEY, updated);
      set({ chats: updated });
      return chat;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      // Supabase is configured but no one is logged in — behave like local
      // mode so guests still get a working, persistent-in-browser chat list.
      const local = readLocal<Chat[]>(LOCAL_CHATS_KEY, []);
      const updated = [chat, ...local];
      writeLocal(LOCAL_CHATS_KEY, updated);
      set((s) => ({ chats: [chat, ...s.chats] }));
      return chat;
    }

    const { data, error } = await supabase
      .from("chats")
      .insert({ title: "New chat", user_id: userData.user.id })
      .select()
      .single();

    if (error || !data) {
      console.error("Kryvium: failed to create chat in Supabase — check that supabase/schema.sql has been run.", error);
      // Still add it locally so the sidebar and chat page don't silently break.
      set((s) => ({ chats: [chat, ...s.chats] }));
      return chat;
    }

    set((s) => ({ chats: [data as Chat, ...s.chats] }));
    return data as Chat;
  },

  renameChat: async (chatId, title) => {
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
    }));
    if (!isSupabaseConfigured) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return;
    }
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return;
    }
    const { error } = await supabase.from("chats").update({ title }).eq("id", chatId);
    if (error) console.error("Kryvium: failed to rename chat in Supabase.", error);
  },

  pinChat: async (chatId, pinned) => {
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, pinned } : c)),
    }));
    if (!isSupabaseConfigured) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return;
    }
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return;
    }
    const { error } = await supabase.from("chats").update({ pinned }).eq("id", chatId);
    if (error) console.error("Kryvium: failed to pin/unpin chat in Supabase.", error);
  },

  deleteChat: async (chatId) => {
    set((s) => {
      const { [chatId]: _removed, ...restMessages } = s.messages;
      return {
        chats: s.chats.filter((c) => c.id !== chatId),
        messages: restMessages,
      };
    });
    if (!isSupabaseConfigured) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      delete all[chatId];
      writeLocal(LOCAL_MSGS_KEY, all);
      return;
    }
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      delete all[chatId];
      writeLocal(LOCAL_MSGS_KEY, all);
      return;
    }
    const { error } = await supabase.from("chats").delete().eq("id", chatId);
    if (error) console.error("Kryvium: failed to delete chat in Supabase.", error);
  },

  addMessage: async (chatId, message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: nanoid(),
      chat_id: chatId,
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [...(s.messages[chatId] ?? []), newMessage],
      },
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, updated_at: newMessage.created_at } : c
      ),
    }));

    if (!isSupabaseConfigured) {
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      all[chatId] = [...(all[chatId] ?? []), newMessage];
      writeLocal(LOCAL_MSGS_KEY, all);
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return newMessage;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      // Guest with Supabase configured — mirror to local storage instead.
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      all[chatId] = [...(all[chatId] ?? []), newMessage];
      writeLocal(LOCAL_MSGS_KEY, all);
      writeLocal(LOCAL_CHATS_KEY, get().chats);
      return newMessage;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        role: message.role,
        content: message.content,
        model: message.model,
        thinking: message.thinking,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Kryvium: failed to save message to Supabase — check that supabase/schema.sql has been run.", error);
      return newMessage;
    }

    return data as ChatMessage;
  },

  updateMessage: (chatId, messageId, content, thinking) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, content, thinking: thinking ?? m.thinking } : m
        ),
      },
    }));
    if (!isSupabaseConfigured) {
      const all = readLocal<Record<string, ChatMessage[]>>(LOCAL_MSGS_KEY, {});
      all[chatId] = (all[chatId] ?? []).map((m) =>
        m.id === messageId ? { ...m, content, thinking: thinking ?? m.thinking } : m
      );
      writeLocal(LOCAL_MSGS_KEY, all);
    }
  },

  setChatTitle: async (chatId, title) => {
    await get().renameChat(chatId, title);
  },
}));

export type { ModelId };
