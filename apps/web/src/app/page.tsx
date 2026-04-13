"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingCtaSection } from "@/components/landing-cta-section";
import { LandingFeatureShowcase } from "@/components/landing-feature-showcase";
import { LandingStatsBar } from "@/components/landing-stats-bar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { useTranslation } from "@/lib/i18n/context";

export default function LandingPage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(Boolean(data.user));
        }
      } catch {
        // ignore
      } finally {
        setChecked(true);
      }
    }
    checkAuth();
  }, []);

  const primaryHref = isAuthenticated ? "/dashboard" : "/auth/signup";
  const primaryLabel = isAuthenticated ? t("landing.hero.dashboard") : t("landing.hero.cta");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08111d] text-white">
      <div className="relative isolate min-h-screen bg-[linear-gradient(180deg,#08111d_0%,#0b1522_42%,#0a1320_100%)]">

        <section className="relative flex min-h-screen flex-col px-4 pb-8 pt-0 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col">
            <header className="animate-fade-up relative z-50 flex w-full flex-row items-center justify-between py-5">
              <Link href="/" className="flex shrink-0 items-center">
                <Image
                  src="/BB_logo.png"
                  alt="Bull &amp; Bear"
                  width={800}
                  height={800}
                  className="h-30 w-30 object-contain sm:h-56 sm:w-56 md:h-[16rem] md:w-[16rem]"
                  priority
                />
              </Link>

              {/* Mobile Header Controls */}
              <div className="flex items-center gap-3 sm:hidden">
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-white/70 hover:bg-[#1c1c1c]/10 hover:text-white focus:outline-none"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">{isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
                  {isMobileMenuOpen ? (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden items-center self-center gap-3 rounded-full border border-white/10 bg-[#1c1c1c]/[0.04] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur sm:flex sm:justify-end sm:px-4">
                <a
                  href="#a-propos"
                  className="hidden items-center justify-center px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white sm:inline-flex"
                >
                  {t("landing.nav.about")}
                </a>
                <a
                  href="#fonctionnalites"
                  className="hidden items-center justify-center px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white sm:inline-flex"
                >
                  {t("landing.nav.features")}
                </a>

                {/* Language switcher in navbar */}
                <div className="flex items-center">
                  <LanguageSwitcher />
                </div>

                <div className={`flex items-center gap-3 transition-opacity duration-300 ${checked ? "opacity-100" : "opacity-0"}`}>
                  {!isAuthenticated && (
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center rounded-full border border-white/14 bg-[#1c1c1c]/[0.03] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]/[0.08] sm:px-5 sm:py-3"
                    >
                      {t("landing.nav.login")}
                    </Link>
                  )}
                  <Link
                    href={primaryHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#1c1c1c] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 sm:px-5 sm:py-3"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="animate-fade-up absolute left-4 right-4 top-24 z-40 rounded-2xl border border-white/10 bg-[#0b1728] p-6 shadow-2xl sm:hidden">
                <nav className="flex flex-col gap-6">
                  <a
                    href="#a-propos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-200 hover:text-white"
                  >
                    {t("landing.nav.about")}
                  </a>
                  <a
                    href="#fonctionnalites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-200 hover:text-white"
                  >
                    {t("landing.nav.features")}
                  </a>

                  <div className={`flex flex-col gap-3 border-t border-white/10 pt-6 transition-opacity duration-300 ${checked ? "opacity-100" : "opacity-0"}`}>
                    {!isAuthenticated && (
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/14 bg-[#1c1c1c]/[0.03] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white transition active:bg-[#1c1c1c]/[0.08]"
                      >
                        {t("landing.nav.login")}
                      </Link>
                    )}
                    <Link
                      href={primaryHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#1c1c1c] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition active:bg-cyan-50"
                    >
                      {primaryLabel}
                    </Link>
                  </div>
                </nav>
              </div>
            )}

            <div className="flex flex-1 items-center pb-16 pt-6 sm:pt-12 lg:pb-20 lg:pt-16">
              <div className="mx-auto grid w-full max-w-[1380px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="relative order-2 flex justify-center lg:order-1 lg:col-span-7">
                  <Image
                    src="/screen-view.png"
                    alt="Bull &amp; Bear Dashboard"
                    width={1200}
                    height={800}
                    className="relative z-10 h-auto w-full max-w-[760px] object-contain"
                    priority
                  />
                </div>

                <div className="order-1 -mt-4 flex flex-col items-start text-left lg:order-2 lg:col-span-5 lg:-mt-10">
                  <h1 className="text-balance text-[3rem] font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-[4.5rem] lg:text-[5.6rem] xl:text-[6.4rem]">
                    <span className="animate-title-rise block">{t("landing.hero.punchline1")}</span>
                    <span className="animate-title-rise-delayed block text-cyan-100">{t("landing.hero.punchline2")}</span>
                  </h1>

                  <p className="animate-fade-up-delayed-2 mt-8 max-w-[540px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                    {t("landing.hero.subtitle")}
                  </p>

                  <div className="animate-fade-up-delayed-3 mt-10 flex flex-col items-start gap-5">
                    <Link
                      href={primaryHref}
                      className="inline-flex items-center justify-center rounded-full border border-white bg-[#1c1c1c] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition-colors duration-200 hover:bg-slate-100 sm:px-10 sm:py-5 sm:text-base"
                    >
                      <span>{primaryLabel}</span>
                    </Link>
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                      {t("landing.hero.socialProof")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Counter Bar */}
        <LandingStatsBar />

        {/* À propos section */}
        <section id="a-propos" className="relative border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-[760px] text-center">
              <h2 className="mt-10 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                {t("landing.about.title")}
              </h2>
              <p className="mt-8 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                {t("landing.about.description")}
              </p>
            </div>
          </div>
        </section>

        <LandingFeatureShowcase />

        {/* Chart Screenshot Review Section */}
        <section className="relative border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(56,189,248,0.06),transparent_50%)]" />
          <div className="mx-auto max-w-[1380px]">
            <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20 xl:gap-24">
              {/* Image block — left side */}
              <div className="lg:col-span-8">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%)]" />
                  <div className="pointer-events-none absolute -right-12 top-12 h-44 w-44 rounded-full bg-violet-300/12 blur-3xl" />
                  <div className="pointer-events-none absolute -left-8 bottom-16 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#091321]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-300/15 via-cyan-300/8 to-transparent" />
                    <div className="relative aspect-[16/10]">
                      <Image
                        src="/chart_example.png"
                        alt="Chart screenshot review"
                        fill
                        sizes="(min-width: 1024px) 50vw, 92vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text block — right side */}
              <div className="lg:col-span-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/70">
                  {t("landing.chartReview.eyebrow")}
                </p>

                <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem] sm:leading-[1.15] lg:text-[3rem] lg:leading-[1.1]">
                  {t("landing.chartReview.title")}
                </h3>

                <p className="mt-8 max-w-[560px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                  {t("landing.chartReview.description")}
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  {[
                    t("landing.chartReview.bullet1"),
                    t("landing.chartReview.bullet2"),
                    t("landing.chartReview.bullet3"),
                  ].map((bullet) => (
                    <span
                      key={bullet}
                      className="rounded-full border border-white/10 bg-[#1c1c1c]/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(45,212,191,0.06),transparent_50%)]" />
          <div className="mx-auto max-w-[1380px]">
            <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20 xl:gap-24">
              {/* Text block — left side */}
              <div className="lg:col-span-4 lg:order-1 order-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
                  {t("landing.statsSection.eyebrow")}
                </p>

                <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem] sm:leading-[1.15] lg:text-[3rem] lg:leading-[1.1]">
                  {t("landing.statsSection.title")}
                </h3>

                <p className="mt-8 max-w-[560px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                  {t("landing.statsSection.description")}
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  {[
                    t("landing.statsSection.bullet1"),
                    t("landing.statsSection.bullet2"),
                    t("landing.statsSection.bullet3"),
                  ].map((bullet) => (
                    <span
                      key={bullet}
                      className="rounded-full border border-white/10 bg-[#1c1c1c]/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image block — right side */}
              <div className="lg:col-span-8 lg:order-2 order-1">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%)]" />
                  <div className="pointer-events-none absolute -left-12 top-12 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                  <div className="pointer-events-none absolute -right-8 bottom-16 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />

                  <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#091321]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/15 via-emerald-300/8 to-transparent" />
                    <div className="relative aspect-[16/10]">
                      <Image
                        src="/stats_example.png"
                        alt="Advanced statistics review"
                        fill
                        sizes="(min-width: 1024px) 50vw, 92vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="relative border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-[760px] text-center">
              <h2 className="mt-10 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                {t("landing.integrations.title")}
              </h2>
              <p className="mt-8 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                {t("landing.integrations.description")}
              </p>
            </div>

            <div className="mt-24 flex flex-col items-center justify-center gap-16 sm:mt-32 sm:flex-row sm:gap-32">
              <div className="group relative flex flex-col items-center">
                <div className="absolute inset-0 translate-y-2 rounded-3xl bg-emerald-500/10 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-[#1c1c1c]/[0.03] p-6 shadow-2xl backdrop-blur transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald-500/30 group-hover:bg-[#1c1c1c]/[0.06] sm:h-52 sm:w-52 sm:p-8">
                  <Image
                    src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773439524/mt5_i8o5cc.jpg"
                    alt="MetaTrader"
                    width={160}
                    height={160}
                    className="h-full w-full rounded-2xl object-cover opacity-80 transition duration-500 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>
                <span className="mt-6 text-base font-medium tracking-wide text-slate-300 transition duration-500 group-hover:text-white">
                  MetaTrader 4/5
                </span>
              </div>

              <div className="group relative flex flex-col items-center">
                <div className="absolute inset-0 translate-y-2 rounded-3xl bg-emerald-500/10 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-[#1c1c1c]/[0.03] p-6 shadow-2xl backdrop-blur transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald-500/30 group-hover:bg-[#1c1c1c]/[0.06] sm:h-52 sm:w-52 sm:p-8">
                  <Image
                    src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773440476/ctrader_logo_full_pwcbdz.png"
                    alt="cTrader"
                    width={160}
                    height={160}
                    className="h-full w-full rounded-2xl object-cover opacity-80 transition duration-500 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>
                <span className="mt-6 text-base font-medium tracking-wide text-slate-300 transition duration-500 group-hover:text-white">
                  cTrader
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Features Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1380px]">
          <div className="mx-auto max-w-[800px] text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                {t("landing.upcoming.title")}
              </h2>
              <p className="mt-6 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                {t("landing.upcoming.description")}
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <LandingCtaSection href={primaryHref} />

        <SiteFooter />
      </div>
    </main>
  );
}
