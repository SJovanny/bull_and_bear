"use client";

// ============================================================================
// TUTORIAL SECTION - Profile page card to redo tutorials
// ============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKeys } from "@/lib/i18n/types";
import {
  ALL_TUTORIAL_PAGES,
  tutorialPageLabels,
  tutorialPageRoutes,
  type TutorialPage,
} from "@/config/tutorial-steps";

type TutorialSectionProps = {
  tutorialsCompleted: Record<string, boolean>;
};

export function TutorialSection({ tutorialsCompleted }: TutorialSectionProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [pendingPage, setPendingPage] = useState<string | null>(null);

  const handleResetOne = (page: TutorialPage) => {
    setPendingPage(page);
    startTransition(async () => {
      try {
        await fetch("/api/me/tutorial", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset", page }),
        });
        router.push(tutorialPageRoutes[page]);
      } catch {
        // Silent fail
      }
      setPendingPage(null);
    });
  };

  const handleResetAll = () => {
    setPendingPage("all");
    startTransition(async () => {
      try {
        await fetch("/api/me/tutorial", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resetAll" }),
        });
        router.push("/dashboard");
      } catch {
        // Silent fail
      }
      setPendingPage(null);
    });
  };

  return (
    <article
      className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm"
      data-tutorial="tutorial-section"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">
        {t("tutorial.section.title" as keyof TranslationKeys)}
      </p>
      <p className="mt-1 text-sm text-secondary font-sans">
        {t("tutorial.section.description" as keyof TranslationKeys)}
      </p>

      <div className="mt-4 space-y-2">
        {ALL_TUTORIAL_PAGES.map((page) => {
          const isCompleted = tutorialsCompleted[page] === true;
          const isLoading = isPending && pendingPage === page;
          const label = tutorialPageLabels[page][locale];

          return (
            <div
              key={page}
              className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-secondary/40" />
                )}
                <span className="text-sm font-medium text-primary font-sans">{label}</span>
              </div>
              <button
                type="button"
                onClick={() => handleResetOne(page)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-400 transition hover:bg-brand-500/10 disabled:opacity-50 font-sans"
              >
                {isLoading ? (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {t("tutorial.section.restart" as keyof TranslationKeys)}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleResetAll}
          disabled={isPending}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-1 disabled:opacity-50 font-sans"
        >
          {isPending && pendingPage === "all" ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              {t("tutorial.section.resettingAll" as keyof TranslationKeys)}
            </span>
          ) : (
            t("tutorial.section.restartAll" as keyof TranslationKeys)
          )}
        </button>
      </div>
    </article>
  );
}
