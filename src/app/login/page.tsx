"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const denied = searchParams.get("denied") === "1";
  const [state, formAction, pending] = useActionState(signIn, null);

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

        <h1 className="text-2xl font-bold text-[#22301F] mb-1">Sign in</h1>
        <p className="text-sm text-[#6B7A6F] mb-6">Internal tool — Golden Tai staff only.</p>

        {denied && (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2.5 mb-4">
            Your account isn&apos;t approved for access.
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="border border-black/15 rounded px-3 py-2.5 text-sm bg-white outline-none focus:border-[#8A6A22]"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="border border-black/15 rounded px-3 py-2.5 text-sm bg-white outline-none focus:border-[#8A6A22]"
          />

          {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 bg-[#1E3A2B] text-[#EFE7D2] rounded px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Please wait…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
