"use client";

import { create } from "zustand";
import type { ModelId } from "@/lib/types";

interface SettingsState {
  model: ModelId;
  thinkingMode: boolean;
  webSearch: boolean;
  setModel: (model: ModelId) => void;
  toggleThinking: () => void;
  toggleWebSearch: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  model: "kryvium-turbo",
  thinkingMode: false,
  webSearch: false,
  setModel: (model) => set({ model }),
  toggleThinking: () => set((s) => ({ thinkingMode: !s.thinkingMode })),
  toggleWebSearch: () => set((s) => ({ webSearch: !s.webSearch })),
}));
