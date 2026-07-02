"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  MessageSquareText,
  LogOut,
  Check,
  ChevronLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useProfileStore } from "@/lib/store/profile-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { LogoutConfirm } from "@/components/settings/logout-confirm";

type Tab = "profile" | "security" | "instructions";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "instructions", label: "Kryvium Instructions", icon: MessageSquareText },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    displayName,
    customInstructions,
    loadProfile,
    updateDisplayName,
    updateEmail,
    updatePassword,
    updateCustomInstructions,
    logout,
  } = useProfileStore();

  const [tab, setTab] = useState<Tab>("profile");
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState("");
  const [instructionsDraft, setInstructionsDraft] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [savedFlags, setSavedFlags] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notices, setNotices] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setNameDraft(displayName);
    setEmailDraft(user?.email ?? "");
    setInstructionsDraft(customInstructions);
  }, [displayName, user, customInstructions]);

  function flash(key: string) {
    setSavedFlags((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSavedFlags((s) => ({ ...s, [key]: false })), 1800);
  }

  async function handleSaveName() {
    setErrors((e) => ({ ...e, name: "" }));
    const res = await updateDisplayName(nameDraft.trim());
    if (res.error) setErrors((e) => ({ ...e, name: res.error! }));
    else flash("name");
  }

  async function handleSaveEmail() {
    setErrors((e) => ({ ...e, email: "" }));
    setNotices((n) => ({ ...n, email: "" }));
    const res = await updateEmail(emailDraft.trim());
    if (res.error) setErrors((e) => ({ ...e, email: res.error! }));
    else if (res.notice) setNotices((n) => ({ ...n, email: res.notice! }));
    else flash("email");
  }

  async function handleSavePassword() {
    setErrors((e) => ({ ...e, password: "" }));
    if (passwordDraft.length < 6) {
      setErrors((e) => ({ ...e, password: "Password must be at least 6 characters." }));
      return;
    }
    if (passwordDraft !== confirmPasswordDraft) {
      setErrors((e) => ({ ...e, password: "Passwords don't match." }));
      return;
    }
    const res = await updatePassword(passwordDraft);
    if (res.error) setErrors((e) => ({ ...e, password: res.error! }));
    else {
      flash("password");
      setPasswordDraft("");
      setConfirmPasswordDraft("");
    }
  }

  async function handleSaveInstructions() {
    setErrors((e) => ({ ...e, instructions: "" }));
    const res = await updateCustomInstructions(instructionsDraft);
    if (res.error) setErrors((e) => ({ ...e, instructions: res.error! }));
    else flash("instructions");
  }

  async function handleConfirmLogout() {
    await logout();
    setShowLogoutConfirm(false);
    router.push(isSupabaseConfigured ? "/auth/login" : "/");
  }

  return (
    <AppShell>
      <div className="animate-content-in flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-4 sm:py-10">
          <button
            onClick={() => router.push("/")}
            className="press mb-5 flex items-center gap-1.5 text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={15} />
            Back to chat
          </button>

          <h1 className="mb-6 text-[22px] font-semibold tracking-tight sm:text-[24px]">Settings</h1>

          <div className="mb-6 flex gap-1 overflow-x-auto border-b pb-px" style={{ borderColor: "var(--border)" }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="press relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium"
                style={{ color: tab === id ? "var(--text)" : "var(--text-muted)" }}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
                {tab === id && (
                  <span
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full"
                    style={{ background: "var(--border-strong)" }}
                  />
                )}
              </button>
            ))}
          </div>

          {!isSupabaseConfigured && (
            <div
              className="animate-fade-up mb-6 rounded-[10px] border px-3.5 py-2.5 text-[12.5px]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              You&apos;re using Kryvium without an account — profile and password changes need Supabase configured. Your display name and instructions still save locally in this browser.
            </div>
          )}

          {tab === "profile" && (
            <div className="animate-fade-up flex flex-col gap-6">
              <Field
                label="Display name"
                value={nameDraft}
                onChange={setNameDraft}
                onSave={handleSaveName}
                saved={savedFlags.name}
                error={errors.name}
                placeholder="Your name"
              />
              <Field
                label="Email"
                value={emailDraft}
                onChange={setEmailDraft}
                onSave={handleSaveEmail}
                saved={savedFlags.email}
                error={errors.email}
                notice={notices.email}
                placeholder="you@example.com"
                disabled={!isSupabaseConfigured || !user}
                type="email"
              />
            </div>
          )}

          {tab === "security" && (
            <div className="animate-fade-up flex flex-col gap-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">New password</label>
                <input
                  type="password"
                  value={passwordDraft}
                  onChange={(e) => setPasswordDraft(e.target.value)}
                  disabled={!isSupabaseConfigured || !user}
                  placeholder="••••••••"
                  className="focus-glow w-full rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none disabled:opacity-50"
                  style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPasswordDraft}
                  onChange={(e) => setConfirmPasswordDraft(e.target.value)}
                  disabled={!isSupabaseConfigured || !user}
                  placeholder="••••••••"
                  className="focus-glow w-full rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none disabled:opacity-50"
                  style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
                />
                {errors.password && (
                  <p className="animate-error-shake mt-1.5 text-[12px]" style={{ color: "var(--danger)" }}>
                    {errors.password}
                  </p>
                )}
              </div>
              <button
                onClick={handleSavePassword}
                disabled={!isSupabaseConfigured || !user}
                className="press flex w-fit items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] font-medium disabled:opacity-40"
                style={{ background: "var(--border-strong)", color: "var(--bg)" }}
              >
                {savedFlags.password ? <Check size={14} /> : null}
                {savedFlags.password ? "Password updated" : "Update password"}
              </button>
            </div>
          )}

          {tab === "instructions" && (
            <div className="animate-fade-up flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  How would you like Kryvium to respond?
                </label>
                <p className="mb-2.5 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                  These instructions apply to every new message across all your chats — tone, formatting
                  preferences, languages you use, things to avoid, or anything else worth Kryvium knowing.
                </p>
                <textarea
                  value={instructionsDraft}
                  onChange={(e) => setInstructionsDraft(e.target.value)}
                  rows={8}
                  placeholder="e.g. Prefer TypeScript over JavaScript. Keep explanations short. Always suggest tests."
                  className="focus-glow w-full resize-none rounded-[12px] border px-3.5 py-3 text-[13.5px] outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
                />
                {errors.instructions && (
                  <p className="animate-error-shake mt-1.5 text-[12px]" style={{ color: "var(--danger)" }}>
                    {errors.instructions}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveInstructions}
                className="press flex w-fit items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] font-medium"
                style={{ background: "var(--border-strong)", color: "var(--bg)" }}
              >
                {savedFlags.instructions ? <Check size={14} /> : null}
                {savedFlags.instructions ? "Saved" : "Save instructions"}
              </button>
            </div>
          )}

          <div className="mt-10 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="press flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium"
              style={{ borderColor: "var(--border)", color: "var(--danger)" }}
            >
              <LogOut size={14} strokeWidth={1.75} />
              Log out
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirm onConfirm={handleConfirmLogout} onCancel={() => setShowLogoutConfirm(false)} />
      )}
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  onSave,
  saved,
  error,
  notice,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saved?: boolean;
  error?: string;
  notice?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="focus-glow flex-1 rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none disabled:opacity-50"
          style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
        />
        <button
          onClick={onSave}
          disabled={disabled}
          className="press flex flex-shrink-0 items-center gap-1.5 rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium disabled:opacity-40"
          style={{ background: "var(--border-strong)", color: "var(--bg)" }}
        >
          {saved ? <Check size={14} /> : null}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      {error && (
        <p className="animate-error-shake mt-1.5 text-[12px]" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
          {notice}
        </p>
      )}
    </div>
  );
}
