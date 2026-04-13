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

  async function handleGoogleLogin() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
    }
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
        
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1c1c]/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:p-8">
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
                className="h-11 rounded-xl border border-white/10 bg-[#1c1c1c]/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-[#1c1c1c]/[0.08] focus:ring-2 placeholder:text-white/30"
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
                className="h-11 rounded-xl border border-white/10 bg-[#1c1c1c]/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-[#1c1c1c]/[0.08] focus:ring-2 placeholder:text-white/30"
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
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1c1c1c] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px flex-1 bg-[#1c1c1c]/10"></div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t("auth.login.or")}</span>
            <div className="h-px flex-1 bg-[#1c1c1c]/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1c1c1c]/[0.03] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]/[0.08] disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {t("auth.signup.google")}
          </button>

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
