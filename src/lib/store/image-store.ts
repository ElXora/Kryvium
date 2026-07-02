"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { GeneratedImage } from "@/lib/types";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const LOCAL_IMAGES_KEY = "kryvium-local-images";

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

interface ImageState {
  images: GeneratedImage[];
  generating: boolean;
  error: string | null;
  loadImages: () => Promise<void>;
  generateImage: (prompt: string) => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  generating: false,
  error: null,

  loadImages: async () => {
    if (!isSupabaseConfigured) {
      set({ images: readLocal<GeneratedImage[]>(LOCAL_IMAGES_KEY, []) });
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("generated_images")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) set({ images: data as GeneratedImage[] });
  },

  generateImage: async (prompt: string) => {
    set({ generating: true, error: null });
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error ?? "Image generation failed.", generating: false });
        return;
      }

      const newImage: GeneratedImage = {
        id: nanoid(),
        user_id: "local",
        prompt,
        image_url: data.imageUrl,
        created_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured) {
        const updated = [newImage, ...get().images];
        writeLocal(LOCAL_IMAGES_KEY, updated);
        set({ images: updated, generating: false });
        return;
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const { data: inserted } = await supabase
        .from("generated_images")
        .insert({ prompt, image_url: data.imageUrl, user_id: userData.user?.id })
        .select()
        .single();

      set((s) => ({
        images: [(inserted as GeneratedImage) ?? newImage, ...s.images],
        generating: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error.",
        generating: false,
      });
    }
  },
}));
