"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { name } } });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F1E3] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#C99A34] flex items-center justify-center font-bold text-[#1E3A2B]">
            G
          </div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight text-[#22301F]">Golden Tai</div>
            <div className="text-[8.5px] tracking-[0.18em] text-[#6B7A6F] uppercase font-mono">
              Operations
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#22301F] mb-1">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-sm text-[#6B7A6F] mb-6">
          {mode === "signin"
            ? "Internal tool — Golden Tai staff only."
            : "First-time setup for a new team member."}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-black/15 rounded px-3 py-2.5 text-sm bg-white outline-none focus:border-[#8A6A22]"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black/15 rounded px-3 py-2.5 text-sm bg-white outline-none focus:border-[#8A6A22]"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-black/15 rounded px-3 py-2.5 text-sm bg-white outline-none focus:border-[#8A6A22]"
          />

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#1E3A2B] text-[#EFE7D2] rounded px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-[#8A6A22] hover:text-[#B8862F]"
        >
          {mode === "signin" ? "New team member? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
