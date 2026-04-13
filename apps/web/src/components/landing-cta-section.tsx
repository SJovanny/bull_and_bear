"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

export function LandingCtaSection({ href }: { href: string }) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.15),transparent_50%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-teal-500/8 blur-[80px]" />

      <div className="relative mx-auto max-w-[760px] text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
          {t("landing.cta.headline")}
        </h2>

        <p className="mt-8 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
          {t("landing.cta.subtitle")}
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            href={href}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#1c1c1c] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(56,189,248,0.3)]"
          >
            {/* Animated gradient on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-teal-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">{t("landing.cta.button")}</span>
          </Link>
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
          {t("landing.hero.socialProof")}
        </p>
      </div>
    </section>
  );
}
