"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Zap, Shield, LineChart, Calendar, Layers } from "lucide-react";

import { AnimatedChartBackground } from "@/components/landing/animated-chart-background";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/landing/scroll-reveal";
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
      const params = new URLSearchParams(window.location.search);
      if (params.get("authError") === "unauthorized") {
        sessionStorage.removeItem("bb-is-authenticated");
        setIsAuthenticated(false);
        setChecked(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("authError");
        url.searchParams.delete("next");
        window.history.replaceState({}, "", url.pathname + url.search);
        return;
      }

      const cached = sessionStorage.getItem("bb-is-authenticated");
      if (cached !== null) {
        setIsAuthenticated(cached === "true");
        setChecked(true);
        return;
      }

      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          const authed = Boolean(data.user);
          setIsAuthenticated(authed);
          sessionStorage.setItem("bb-is-authenticated", String(authed));
        } else {
          sessionStorage.setItem("bb-is-authenticated", "false");
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

  const features = [
    {
      icon: LineChart,
      title: t("landing.features.journal.title"),
      description: t("landing.features.journal.desc"),
    },
    {
      icon: Calendar,
      title: t("landing.features.calendar.title"),
      description: t("landing.features.calendar.desc"),
    },
    {
      icon: BarChart3,
      title: t("landing.features.stats.title"),
      description: t("landing.features.stats.desc"),
    },
    {
      icon: Layers,
      title: t("landing.features.accounts.title"),
      description: t("landing.features.accounts.desc"),
    },
    {
      icon: Zap,
      title: t("landing.features.import.title"),
      description: t("landing.features.import.desc"),
    },
    {
      icon: Shield,
      title: t("landing.features.darkMode.title"),
      description: t("landing.features.darkMode.desc"),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      <AnimatedChartBackground />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-50 flex w-full items-start justify-between py-4"
          >
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center">
              <Image
                src="/BB_logo.png"
                alt="Bull &amp; Bear"
                width={800}
                height={800}
                className="h-33 w-33 object-contain sm:h-56 sm:w-56 md:h-72 md:w-72 -mt-8 sm:-mt-14 md:-mt-20"
                priority
              />
            </Link>

            {/* Mobile Header Controls */}
            <div className="flex items-center gap-3 sm:hidden">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">{isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
                {isMobileMenuOpen ? (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Desktop Navigation — independently positioned top-right */}
            <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-xl sm:flex self-start mt-4">
              <a
                href="#about"
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:text-slate-900"
              >
                {t("landing.nav.about")}
              </a>
              <a
                href="#features"
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:text-slate-900"
              >
                {t("landing.nav.features")}
              </a>
              <a
                href="#contact"
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:text-slate-900"
              >
                {t("landing.nav.contact")}
              </a>
              <LanguageSwitcher />
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${checked ? "opacity-100" : "opacity-0"}`}>
                {!isAuthenticated && (
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-100"
                  >
                    {t("landing.nav.login")}
                  </Link>
                )}
                <Link
                  href={primaryHref}
                  className="rounded-full bg-blue-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-blue-400"
                >
                  {primaryLabel}
                </Link>
              </div>
            </nav>
          </motion.header>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 right-4 top-24 z-40 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:hidden"
            >
              <nav className="flex flex-col gap-4">
                <a
                  href="#about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-slate-900"
                >
                  {t("landing.nav.about")}
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-slate-900"
                >
                  {t("landing.nav.features")}
                </a>
                <div className={`flex flex-col gap-3 border-t border-slate-200 pt-4 transition-opacity duration-300 ${checked ? "opacity-100" : "opacity-0"}`}>
                  {!isAuthenticated && (
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-700"
                    >
                      {t("landing.nav.login")}
                    </Link>
                  )}
                  <Link
                    href={primaryHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl bg-blue-500 px-5 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}

          {/* Hero Content */}
          <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex items-center gap-3"
            >
             
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-4xl text-balance text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="text-slate-900">{t("landing.hero.punchline1")}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {t("landing.hero.punchline2")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 max-w-2xl text-pretty text-lg text-slate-600 sm:text-xl"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href={primaryHref}
                className="group relative overflow-hidden rounded-full bg-blue-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] sm:px-10 sm:py-5"
              >
                <span className="relative z-10">{primaryLabel}</span>
              </Link>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {t("landing.hero.socialProof")}
              </span>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs uppercase tracking-widest text-slate-500">Scroll</span>
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-slate-200 bg-slate-50/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
          <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "50K+", label: t("landing.stats.tradesAnalyzed") },
              { value: "1,200+", label: t("landing.stats.tradersOnboard") },
              { value: "5+", label: t("landing.stats.brokersIntegrated") },
              { value: "1M+", label: t("landing.stats.dataPoints") },
            ].map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600 sm:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-600">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("landing.about.title")}
            </h2>
            <p className="mt-8 text-pretty text-lg leading-relaxed text-slate-600">
              {t("landing.about.description")}
            </p>
          </ScrollReveal>

          {/* Bull & Bear Visual */}
          <ScrollReveal delay={0.2} className="mt-16 flex items-center justify-center gap-8">
            <div className="relative h-48 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-green-500/10 to-transparent p-6 sm:h-64 sm:w-64">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_70%)]" />
              {/* Placeholder for Bull image */}
              <div className="flex h-full w-full flex-col items-center justify-center">
                <TrendingUp className="h-16 w-16 text-green-500 sm:h-24 sm:w-24" />
                <span className="mt-4 text-xl font-bold text-green-600">BULL</span>
              </div>
            </div>
            <div className="relative h-48 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-red-500/10 to-transparent p-6 sm:h-64 sm:w-64">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_70%)]" />
              {/* Placeholder for Bear image */}
              <div className="flex h-full w-full flex-col items-center justify-center">
                <TrendingDown className="h-16 w-16 text-red-500 sm:h-24 sm:w-24" />
                <span className="mt-4 text-xl font-bold text-red-600">BEAR</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

       {/* Dashboard Preview Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-3 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_50%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src="/dashboard_example.png"
                    alt="Bull & Bear Dashboard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="order-1 lg:order-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                {t("landing.showcase.feat1.eyebrow")}
              </p>
              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {t("landing.showcase.feat1.title")}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {t("landing.showcase.feat1.desc")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("landing.showcase.feat1.bullet1"),
                  t("landing.showcase.feat1.bullet2"),
                  t("landing.showcase.feat1.bullet3"),
                ].map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Journal Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">
                {t("landing.showcase.feat2.eyebrow")}
              </p>
              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {t("landing.showcase.feat2.title")}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {t("landing.showcase.feat2.desc")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("landing.showcase.feat2.bullet1"),
                  t("landing.showcase.feat2.bullet2"),
                  t("landing.showcase.feat2.bullet3"),
                ].map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-3 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_50%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src="/journal_example.png"
                    alt="Bull & Bear Journal"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Preview Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-3 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src="/stats_example.png"
                    alt="Bull & Bear Statistics"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="order-1 lg:order-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                {t("landing.statsSection.eyebrow")}
              </p>
              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {t("landing.statsSection.title")}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {t("landing.statsSection.description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("landing.statsSection.bullet1"),
                  t("landing.statsSection.bullet2"),
                  t("landing.statsSection.bullet3"),
                ].map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Charts Review Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                {t("landing.chartsSection.eyebrow")}
              </p>
              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {t("landing.chartsSection.title")}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {t("landing.chartsSection.description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("landing.chartsSection.bullet1"),
                  t("landing.chartsSection.bullet2"),
                  t("landing.chartsSection.bullet3"),
                ].map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-3 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_50%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src="/chart_example.png"
                    alt="Bull & Bear Charts"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="relative z-10 overflow-hidden border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
                {t("landing.mobileSection.eyebrow")}
              </p>
              <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {t("landing.mobileSection.title")}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {t("landing.mobileSection.description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("landing.mobileSection.bullet1"),
                  t("landing.mobileSection.bullet2"),
                  t("landing.mobileSection.bullet3"),
                ].map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="flex justify-center">
                <div className="relative w-64 sm:w-72">
                  {/* Phone frame */}
                  <div className="relative rounded-[3rem] border-[6px] border-slate-900 bg-slate-900 shadow-[0_40px_80px_rgba(0,0,0,0.25)]">
                    {/* Notch */}
                    <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-3">
                      <div className="h-6 w-24 rounded-full bg-slate-900" />
                    </div>
                    {/* Screen */}
                    <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.5rem] bg-slate-100">
                      <Image
                        src="/mobile.png"
                        alt="Bull & Bear Mobile"
                        fill
                        sizes="300px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -bottom-8 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t("landing.features.title")}
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              {t("landing.features.subtitle")}
            </p>
          </ScrollReveal>

          <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 transition-all duration-300 hover:border-blue-300 hover:bg-slate-50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <feature.icon className="h-10 w-10 text-blue-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative z-10 border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t("landing.integrations.title")}
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              {t("landing.integrations.description")}
            </p>
          </ScrollReveal>

            <StaggerContainer className="mt-16 flex flex-col items-center justify-center gap-12 sm:flex-row sm:gap-20">
            <StaggerItem>
              <div className="group flex h-40 w-40 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-blue-300 hover:bg-slate-100 sm:h-52 sm:w-52 sm:p-8">
                <Image
                  src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773439524/mt5_i8o5cc.jpg"
                  alt="MetaTrader"
                  width={160}
                  height={160}
                  className="h-full w-full object-contain"
                />
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="group flex h-40 w-40 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-blue-300 hover:bg-slate-100 sm:h-52 sm:w-52 sm:p-8">
                <Image
                  src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773440476/ctrader_logo_full_pwcbdz.png"
                  alt="cTrader"
                  width={160}
                  height={160}
                  className="h-full w-full object-contain"
                />
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white p-8 sm:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {t("landing.cta.headline")}
                </h2>
                <p className="mt-6 text-lg text-slate-600">
                  {t("landing.cta.subtitle")}
                </p>
                <Link
                  href={primaryHref}
                  className="mt-10 inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] sm:px-10 sm:py-5"
                >
                  {t("landing.cta.button")}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal className="mx-auto max-w-xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t("landing.contact.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {t("landing.contact.description")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-mono text-sm text-slate-900">
                bullandbear.journal@gmail.com
              </span>
              <a
                href="mailto:bullandbear.journal@gmail.com"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {t("landing.contact.button")}
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              {t("landing.contact.response")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
