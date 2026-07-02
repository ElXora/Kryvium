"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { KryviumMark } from "@/components/ui/kryvium-mark";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment to enable accounts."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "register") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setNotice("Check your email to confirm your account, then log in.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div
        className="w-full max-w-sm rounded-[18px] border p-7"
        style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}
      >
        <div className="mb-6 flex flex-col items-center gap-2.5">
          <KryviumMark size={40} />
          <h1 className="text-[18px] font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            {mode === "login" ? "Log in to continue to Kryvium" : "Sign up to start using Kryvium"}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div
            className="mb-4 flex items-start gap-2 rounded-[10px] border px-3 py-2.5 text-[12.5px]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            Accounts aren&apos;t set up yet — you can still use Kryvium without logging in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none"
              style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            className="rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none"
            style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="rounded-[10px] border px-3.5 py-2.5 text-[13.5px] outline-none"
            style={{ borderColor: "var(--border)", background: "var(--bg-sunken)" }}
          />

          {error && (
            <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13.5px] font-medium transition-opacity disabled:opacity-60"
            style={{ background: "var(--border-strong)", color: "var(--bg)" }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="underline" style={{ color: "var(--text)" }}>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a href="/auth/login" className="underline" style={{ color: "var(--text)" }}>
                Log in
              </a>
            </>
          )}
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-3 w-full text-center text-[12px] underline"
          style={{ color: "var(--text-faint)" }}
        >
          Continue without an account
        </button>
      </div>
    </div>
  );
}
