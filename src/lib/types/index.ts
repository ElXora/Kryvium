export type ModelId = "kryvium-turbo" | "kryvium-tank";

export interface ModelOption {
  id: ModelId;
  label: string;
  description: string;
  geminiModel: string;
  fallbackGeminiModel: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "kryvium-turbo",
    label: "Kryvium Turbo",
    description: "Fast responses, great for everyday coding",
    geminiModel: "gemini-3.5-flash",
    fallbackGeminiModel: "gemini-2.5-flash",
  },
  {
    id: "kryvium-tank",
    label: "Kryvium Tank",
    description: "Heavier reasoning, best for complex problems",
    geminiModel: "gemini-3.1-pro-preview",
    fallbackGeminiModel: "gemini-2.5-pro",
  },
];

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  model?: ModelId;
  thinking?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  custom_instructions: string | null;
  created_at: string;
}
