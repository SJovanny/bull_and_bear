"use client";

import Link from "next/link";
import Image from "next/image";
import { type ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/context";

type PublicShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PublicShell({ title, subtitle, children }: PublicShellProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 shrink-0">
            <Image
              src="/BB_logo.png"
              alt="Bull & Bear"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold text-slate-900 hidden sm:inline">Bull &amp; Bear</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-600 transition hover:text-cyan-600">
              {locale === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link href="/blog" className="text-slate-600 transition hover:text-cyan-600">
              Blog
            </Link>
            <Link href="/faq" className="text-slate-600 transition hover:text-cyan-600">
              FAQ
            </Link>
            <Link href="/pricing" className="text-slate-600 transition hover:text-cyan-600">
              {locale === "fr" ? "Tarifs" : "Pricing"}
            </Link>
            <Link href="/contact" className="text-slate-600 transition hover:text-cyan-600">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* FR / EN toggle */}
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setLocale("fr")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  locale === "fr"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLocale("en")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  locale === "en"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
            </div>
            <Link
              href="/auth/signup"
              className="hidden sm:inline-flex items-center rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-400"
            >
              {locale === "fr" ? "Essai gratuit" : "Free trial"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-5xl">
          {subtitle && (
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">
              {subtitle}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bull &amp; Bear. {locale === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/" className="transition hover:text-cyan-600">
              {locale === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link href="/blog" className="transition hover:text-cyan-600">Blog</Link>
            <Link href="/faq" className="transition hover:text-cyan-600">FAQ</Link>
            <Link href="/pricing" className="transition hover:text-cyan-600">
              {locale === "fr" ? "Tarifs" : "Pricing"}
            </Link>
            <Link href="/contact" className="transition hover:text-cyan-600">Contact</Link>
            <Link href="/legal/privacy-policy" className="transition hover:text-cyan-600">
              {locale === "fr" ? "Confidentialité" : "Privacy"}
            </Link>
            <Link href="/legal/terms" className="transition hover:text-cyan-600">
              {locale === "fr" ? "CGU" : "Terms"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
