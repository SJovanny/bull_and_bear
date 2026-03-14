"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingFeatureShowcase } from "@/components/landing-feature-showcase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { useTranslation } from "@/lib/i18n/context";

export default function LandingPage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

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
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="relative isolate min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(45,212,191,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_48%,#07111f_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent_92%)]" />
        <div className="pointer-events-none absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl" />

        <section className="relative flex min-h-screen flex-col px-4 pb-8 pt-0 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col">
            <header className="animate-fade-up flex flex-col items-center justify-between gap-4 py-2 sm:flex-row sm:items-start">
              <Link href="/" className="shrink-0 -mt-6 sm:-mt-16 sm:-ml-8">
                <Image
                  src="/BB_logo.png"
                  alt="Bull & Bear"
                  width={800}
                  height={800}
                  className="h-40 w-40 object-contain sm:h-64 sm:w-64 md:h-[18rem] md:w-[18rem]"
                  priority
                />
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:justify-end sm:px-4">
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
                      className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08] sm:px-5 sm:py-3"
                    >
                      {t("landing.nav.login")}
                    </Link>
                  )}
                  <Link
                    href={primaryHref}
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 sm:px-5 sm:py-3"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              </div>
            </header>

            <div className="flex flex-1 flex-col justify-center pb-14 pt-4 sm:pt-8 lg:pb-20 lg:pt-12">
              <div className="mx-auto flex max-w-[980px] flex-col items-center text-center -mt-8 sm:-mt-32">
                <span className="animate-fade-up-delayed inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-300/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/86">
                  {t("landing.hero.title")}
                </span>

                <h1 className="mt-8 text-balance text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-[4.8rem] lg:text-[7rem] xl:text-[8rem]">
                  <span className="animate-title-rise block">{t("landing.hero.punchline1")}</span>
                  <span className="animate-title-rise-delayed block text-cyan-100">{t("landing.hero.punchline2")}</span>
                </h1>

                <p className="animate-fade-up-delayed-2 mt-6 max-w-[760px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                  {t("landing.hero.subtitle")}
                </p>

                <div className="animate-fade-up-delayed-3 mt-10 flex flex-col items-center">
                  <span className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    ↓
                  </span>
                  <svg
                    className="h-8 w-8 animate-bounce text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* À propos section */}
        <section id="a-propos" className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                {t("landing.about.title")}
              </span>
              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                {t("landing.about.title")}
              </h2>
              <p className="mt-5 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                {t("landing.about.description")}
              </p>
            </div>
          </div>
        </section>

        <LandingFeatureShowcase />

        {/* Integrations Section */}
        <section className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
                {t("landing.integrations.eyebrow")}
              </span>
              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                {t("landing.integrations.title")}
              </h2>
              <p className="mt-5 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                {t("landing.integrations.description")}
              </p>
            </div>

            <div className="mt-16 flex flex-col items-center justify-center gap-10 sm:mt-20 sm:flex-row sm:gap-20">
              <div className="group relative flex flex-col items-center">
                <div className="absolute inset-0 translate-y-2 rounded-3xl bg-emerald-500/10 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald-500/30 group-hover:bg-white/[0.06] sm:h-52 sm:w-52 sm:p-8">
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
                <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald-500/30 group-hover:bg-white/[0.06] sm:h-52 sm:w-52 sm:p-8">
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

        <SiteFooter />
      </div>
    </main>
  );
}
