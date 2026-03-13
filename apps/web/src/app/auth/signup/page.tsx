"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { supabaseClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

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

    setMessage(t("auth.signup.success"));
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="relative isolate flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(45,212,191,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_48%,#07111f_100%)] px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent_92%)]" />
        <div className="pointer-events-none absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl" />

        <Link href="/" className="relative z-10 mb-2 inline-block sm:mb-6">
          <Image
            src="/BB_logo.png"
            alt="Bull & Bear"
            width={800}
            height={800}
            className="h-48 w-48 object-contain transition-opacity hover:opacity-80 sm:h-64 sm:w-64"
            priority
          />
        </Link>
        
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:p-8">
          <p className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-300/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/86">
            Authentication
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{t("auth.signup.title")}</h1>
          <p className="mt-2 text-sm text-slate-300">{t("auth.signup.subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">{t("auth.signup.email")}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 placeholder:text-white/30"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">{t("auth.signup.password")}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 placeholder:text-white/30"
                required
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t("auth.signup.hasAccount")}{" "}
            <Link href="/auth/login" className="font-medium text-cyan-400 transition hover:text-cyan-300">
              {t("auth.signup.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
