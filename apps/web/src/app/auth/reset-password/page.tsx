"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabaseClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase client automatically picks up the hash fragment tokens
    // and fires an onAuthStateChange event. We listen for PASSWORD_RECOVERY
    // to know the session is ready for updateUser().
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      },
    );

    // Also check if there's already a session (e.g. the event already fired
    // before the listener was registered)
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    // Check for error in query params (e.g. expired link redirected here)
    const params = new URLSearchParams(window.location.search);
    const errorDesc = params.get("error_description");
    if (errorDesc) {
      setSessionError(errorDesc);
    }

    // Give it a few seconds to process the hash, then show an error if still not ready
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) {
          setSessionError(t("auth.resetPassword.linkExpired"));
        }
        return current;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [t]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("auth.resetPassword.mismatch"));
      return;
    }

    setIsSubmitting(true);

    const { error: authError } = await supabaseClient.auth.updateUser({
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {t("auth.resetPassword.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {t("auth.resetPassword.subtitle")}
          </p>

          {sessionError ? (
            <div className="mt-8">
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-3 text-sm text-rose-400">
                {sessionError}
              </p>
              <Link
                href="/auth/forgot-password"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                {t("auth.resetPassword.tryAgain")}
              </Link>
            </div>
          ) : !ready ? (
            <div className="mt-8 flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : success ? (
            <div className="mt-8">
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-400">
                {t("auth.resetPassword.success")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {t("auth.resetPassword.password")}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 placeholder:text-white/30"
                  required
                  minLength={6}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {t("auth.resetPassword.confirm")}
                </span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none ring-cyan-500/50 transition focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 placeholder:text-white/30"
                  required
                  minLength={6}
                />
              </label>

              {error ? (
                <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
