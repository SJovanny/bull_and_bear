"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/context";

type PaywallProps = {
  trialDaysLeft?: number;
};

export function Paywall({ trialDaysLeft = 0 }: PaywallProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-lg">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-brand-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-primary font-sans">{t("paywall.title")}</h2>

        {trialDaysLeft > 0 ? (
          <p className="mt-2 text-sm text-secondary font-sans">
            {t("paywall.trialExpiring").replace("{days}", String(trialDaysLeft))}
          </p>
        ) : (
          <p className="mt-2 text-sm text-secondary font-sans">{t("paywall.trialExpired")}</p>
        )}

        <p className="mt-4 text-sm text-secondary font-sans">{t("paywall.description")}</p>

        <Link
          href="/pricing"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {t("paywall.cta")}
        </Link>

        <p className="mt-4 text-xs text-secondary/60 font-sans">{t("paywall.dataNote")}</p>
      </div>
    </div>
  );
}
