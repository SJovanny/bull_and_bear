"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslation } from "@/lib/i18n/context";

export function PricingInteractive() {
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [isLoading, setIsLoading] = useState(false);
  const { hasAccess, status, trialDaysLeft, checkout, openPortal, hasSubscription } = useSubscription();
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

  const monthlyPrice = 2.99;
  const yearlyPrice = 26.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  return (
    <>
      {/* Trial banner */}
      {status === "TRIALING" && trialDaysLeft > 0 && (
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

      {/* Dynamic price display */}
      <div className="mt-6 text-right">
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

      {/* CTA button */}
      <div className="mt-8">
        {hasAccess && status === "ACTIVE" ? (
          <button
            type="button"
            onClick={() => void handlePortal()}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {isLoading ? t("pricing.loading") : t("pricing.manageBtn")}
          </button>
        ) : hasSubscription ? (
          <button
            type="button"
            onClick={() => void handleCheckout()}
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
    </>
  );
}
