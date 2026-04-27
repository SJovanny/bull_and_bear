"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-black text-pnl-negative font-mono">500</p>
        <h1 className="mt-4 text-xl font-bold text-primary font-sans">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-secondary font-sans">
          Quelque chose s&apos;est mal passé. Réessayez ou revenez au dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold text-primary transition hover:bg-surface-2"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
