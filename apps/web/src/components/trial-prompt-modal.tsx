"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useSubscription } from "@/hooks/use-subscription";

export function TrialPromptModal() {
  const { t } = useTranslation();
  const { checkout } = useSubscription();
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [redirecting, setRedirecting] = useState(false);

  async function handleSubscribe() {
    setRedirecting(true);
    try {
      await checkout(interval);
    } catch {
      setRedirecting(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 shadow-2xl">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-brand-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-primary font-sans">
          {t("trialPrompt.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-secondary font-sans">
          {t("trialPrompt.subtitle")}
        </p>

        {/* Plan toggle */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={`flex-1 rounded-xl border-2 p-4 text-center transition ${
              interval === "month"
                ? "border-brand-500 bg-brand-500/5"
                : "border-border hover:border-secondary"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans">
              {t("trialPrompt.monthly")}
            </p>
            <p className="mt-1 text-lg font-bold text-primary font-sans">
              {t("trialPrompt.monthlyPrice")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setInterval("year")}
            className={`relative flex-1 rounded-xl border-2 p-4 text-center transition ${
              interval === "year"
                ? "border-brand-500 bg-brand-500/5"
                : "border-border hover:border-secondary"
            }`}
          >
            <span className="absolute -top-2.5 right-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {t("trialPrompt.yearlySave")}
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans">
              {t("trialPrompt.yearly")}
            </p>
            <p className="mt-1 text-lg font-bold text-primary font-sans">
              {t("trialPrompt.yearlyPrice")}
            </p>
          </button>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={redirecting}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {redirecting ? "..." : t("trialPrompt.cta")}
        </button>

        <p className="mt-3 text-center text-xs text-secondary/70 font-sans">
          {t("trialPrompt.freeTrial")}
        </p>
      </div>
    </div>
  );
}
