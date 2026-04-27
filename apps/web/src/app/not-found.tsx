"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-black text-brand-500 font-mono">404</p>
        <h1 className="mt-4 text-xl font-bold text-primary font-sans">Page introuvable</h1>
        <p className="mt-2 text-sm text-secondary font-sans">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
