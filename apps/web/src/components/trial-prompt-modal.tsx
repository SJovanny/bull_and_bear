"use client";

import { useState } from "react";
import Image from "next/image";
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

  const features = [
    t("trialPrompt.feature1"),
    t("trialPrompt.feature2"),
    t("trialPrompt.feature3"),
  ];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left — Text content */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-primary font-sans">
              {t("trialPrompt.title")}
            </h2>
            <p className="mt-3 text-sm text-secondary font-sans leading-relaxed">
              {t("trialPrompt.subtitle")}
            </p>

            {/* Feature list */}
            <ul className="mt-5 space-y-3">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-primary font-sans">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

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

          {/* Right — Preview image */}
          <div className="hidden md:flex flex-1 items-center justify-center p-8 lg:p-10">
            <Image
              src="/preview.png"
              alt="Bull & Bear app preview"
              width={600}
              height={500}
              className="w-full h-auto rounded-xl object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
