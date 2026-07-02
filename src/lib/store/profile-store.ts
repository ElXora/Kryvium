"use client";

import { create } from "zustand";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const LOCAL_NAME_KEY = "kryvium-local-display-name";
const LOCAL_INSTRUCTIONS_KEY = "kryvium-custom-instructions";

interface ProfileUser {
  id: string;
  email: string | null;
}

interface ProfileState {
  user: ProfileUser | null;
  displayName: string;
  customInstructions: string;
  loading: boolean;
  loaded: boolean;
  loadProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error?: string }>;
  updateEmail: (email: string) => Promise<{ error?: string; notice?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  updateCustomInstructions: (text: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  displayName: "",
  customInstructions: "",
  loading: false,
  loaded: false,

  loadProfile: async () => {
    if (get().loaded) return;
    set({ loading: true });

    if (!isSupabaseConfigured) {
      const name = localStorage.getItem(LOCAL_NAME_KEY) ?? "Guest";
      const instructions = localStorage.getItem(LOCAL_INSTRUCTIONS_KEY) ?? "";
      set({ user: null, displayName: name, customInstructions: instructions, loading: false, loaded: true });
      return;
    }

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      set({ user: null, displayName: "Guest", customInstructions: "", loading: false, loaded: true });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, custom_instructions")
      .eq("id", authData.user.id)
      .single();

    set({
      user: { id: authData.user.id, email: authData.user.email ?? null },
      displayName: profile?.display_name || authData.user.email?.split("@")[0] || "Account",
      customInstructions: profile?.custom_instructions ?? "",
      loading: false,
      loaded: true,
    });
  },

  updateDisplayName: async (name: string) => {
    set({ displayName: name });
    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_NAME_KEY, name);
      return {};
    }
    const supabase = createClient();
    const { user } = get();
    if (!user) return { error: "Not signed in." };
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    return error ? { error: error.message } : {};
  },

  updateEmail: async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Accounts aren't set up yet — add Supabase to change your email." };
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    return { notice: "Check your new email inbox to confirm the change." };
  },

  updatePassword: async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Accounts aren't set up yet — add Supabase to change your password." };
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  },

  updateCustomInstructions: async (text: string) => {
    set({ customInstructions: text });
    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_INSTRUCTIONS_KEY, text);
      return {};
    }
    const supabase = createClient();
    const { user } = get();
    if (!user) {
      localStorage.setItem(LOCAL_INSTRUCTIONS_KEY, text);
      return {};
    }
    const { error } = await supabase.from("profiles").update({ custom_instructions: text }).eq("id", user.id);
    return error ? { error: error.message } : {};
  },

  logout: async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, displayName: "Guest", customInstructions: "", loaded: false });
  },
}));
