"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LegalToc, type TocSection } from "@/components/legal-toc";

type LegalShellProps = {
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  lastUpdated: string;
  sections: TocSection[];
  contentFr: React.ReactNode;
  contentEn: React.ReactNode;
};

export function LegalShell({
  title,
  subtitle,
  lastUpdated,
  sections,
  contentFr,
  contentEn,
}: LegalShellProps) {
  const [lang, setLang] = useState<"fr" | "en">("en");
  const [scrollPct, setScrollPct] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(100, Math.max(0, pct)));
      setShowBackToTop(el.scrollTop > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Reading progress bar */}
      <div
        className="fixed left-0 top-0 z-50 h-0.5 bg-blue-500 transition-all duration-100"
        style={{ width: `${scrollPct}%` }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
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
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{lang === "fr" ? "Légal" : "Legal"}</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700 truncate max-w-[140px] sm:max-w-none">
              {lang === "fr" ? title.fr : title.en}
            </span>
          </div>

          {/* Right side: lang toggle + back link */}
          <div className="flex items-center gap-3">
            {/* FR / EN toggle */}
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setLang("fr")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  lang === "fr"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  lang === "en"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-blue-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === "fr" ? "Accueil" : "Home"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            {lang === "fr" ? subtitle.fr : subtitle.en}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {lang === "fr" ? title.fr : title.en}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            {lang === "fr" ? "Dernière mise à jour" : "Last updated"}: {lastUpdated}
          </p>

          {/* Mobile ToC toggle */}
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
            </svg>
            {lang === "fr" ? "Sommaire" : "Table of contents"}
            <svg
              className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Mobile ToC expanded */}
          {mobileTocOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
              <LegalToc sections={sections} lang={lang} />
            </div>
          )}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 xl:gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <LegalToc sections={sections} lang={lang} />
              </div>

              {/* Other legal doc link */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  {lang === "fr" ? "Documents légaux" : "Legal docs"}
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/legal/privacy-policy"
                    className="text-sm text-slate-600 hover:text-blue-600 transition flex items-center gap-2"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
                  </Link>
                  <Link
                    href="/legal/terms"
                    className="text-sm text-slate-600 hover:text-blue-600 transition flex items-center gap-2"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {lang === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main>
            <div className="prose prose-slate max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-xl prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200
              prose-h3:text-base prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-li:text-slate-600 prose-li:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-800 prose-strong:font-semibold
              prose-table:text-sm
              prose-thead:bg-slate-50
              prose-th:text-slate-700 prose-th:font-semibold prose-th:px-4 prose-th:py-3
              prose-td:px-4 prose-td:py-3 prose-td:text-slate-600
              prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden
              [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200
              [&_tr:nth-child(even)_td]:bg-slate-50/60
              [&_h2]:scroll-mt-28
            ">
              {lang === "fr" ? contentFr : contentEn}
            </div>

            {/* Footer contact */}
            <div className="mt-16 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {lang === "fr" ? "Des questions ?" : "Have questions?"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {lang === "fr"
                      ? "Notre équipe répond dans les 24–48 heures."
                      : "Our team responds within 24–48 hours."}
                  </p>
                </div>
                <a
                  href="mailto:bullandbear.journal@gmail.com"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  bullandbear.journal@gmail.com
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition hover:bg-slate-50 lg:hidden"
          aria-label="Back to top"
        >
          <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Page footer */}
      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bull &amp; Bear. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy-policy" className="transition hover:text-blue-600">
              {lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
            </Link>
            <Link href="/legal/terms" className="transition hover:text-blue-600">
              {lang === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
