"use client";

import Link from "next/link";
import { useState } from "react";

import { supabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      "Account created. Check your inbox if email confirmation is enabled in Supabase settings.",
    );
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#ecfeff_0%,#f8fafc_45%,#e0f2fe_100%)] px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-600">Authentication</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sign up</h1>
        <p className="mt-2 text-sm text-slate-600">Create your account to start journaling trades and psychology.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-cyan-500 transition focus:ring-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-cyan-500 transition focus:ring-2"
              required
            />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-cyan-700 hover:text-cyan-600">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
