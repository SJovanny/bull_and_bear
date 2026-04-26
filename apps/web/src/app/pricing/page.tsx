"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useSubscription } from "@/hooks/use-subscription";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKeys } from "@/lib/i18n/types";

export default function PricingPage() {
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [isLoading, setIsLoading] = useState(false);
  const { hasAccess, status, trialDaysLeft, checkout, openPortal, hasStripeAccount } = useSubscription();
  const { t } = useTranslation();

  async function handleCheckout() {
    setIsLoading(true);
    try {
      await checkout(interval);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePortal() {
    setIsLoading(true);
    try {
      await openPortal();
    } finally {
      setIsLoading(false);
    }
  }

  const monthlyPrice = 5;
  const yearlyPrice = 50;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-300">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/BB_logo.png" alt="Bull & Bear" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-white">Bull &amp; Bear</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-cyan-400">
            {t("pricing.backToDashboard")}
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{t("pricing.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{t("pricing.title")}</h1>
          <p className="mt-3 text-slate-400">{t("pricing.subtitle")}</p>

          {/* Trial banner */}
          {status === "trialing" && trialDaysLeft > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("pricing.trialBanner").replace("{days}", String(trialDaysLeft))}
            </div>
          )}

          {/* Interval toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setInterval("month")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                interval === "month" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              {t("pricing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setInterval("year")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                interval === "year" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              {t("pricing.yearly")}
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                {t("pricing.yearlyBadge")}
              </span>
            </button>
          </div>

          {/* Pricing card */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Bull &amp; Bear Pro</h2>
                <p className="mt-1 text-sm text-slate-400">{t("pricing.cardDesc")}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {interval === "month" ? `${monthlyPrice}€` : `${yearlyMonthly}€`}
                  <span className="text-base font-normal text-slate-500">/{t("pricing.perMonth")}</span>
                </p>
                {interval === "year" && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t("pricing.billedYearly").replace("{price}", String(yearlyPrice))}
                  </p>
                )}
              </div>
            </div>

            <hr className="my-6 border-white/10" />

            <ul className="space-y-3 text-sm text-slate-300">
              {[
                "pricing.feat.accounts",
                "pricing.feat.trades",
                "pricing.feat.journal",
                "pricing.feat.stats",
                "pricing.feat.import",
                "pricing.feat.export",
                "pricing.feat.support",
              ].map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t(key as keyof TranslationKeys)}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {hasAccess && status === "active" ? (
                <button
                  type="button"
                  onClick={() => void handlePortal()}
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  {isLoading ? t("pricing.loading") : t("pricing.manageBtn")}
                </button>
              ) : hasStripeAccount && status !== "trialing" ? (
                <button
                  type="button"
                  onClick={() => void handlePortal()}
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {isLoading ? t("pricing.loading") : t("pricing.resubscribeBtn")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleCheckout()}
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {isLoading ? t("pricing.loading") : t("pricing.subscribeBtn")}
                </button>
              )}
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">{t("pricing.footer")}</p>
        </div>
      </main>
    </div>
  );
}
