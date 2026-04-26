"use client";

// ============================================================================
// TUTORIAL PROVIDER - Renders a React Joyride guided tour per page
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { EventData, Controls } from "react-joyride";
import type { Step } from "react-joyride";
import { useTranslation } from "@/lib/i18n/context";
import type { TutorialPage } from "@/config/tutorial-steps";
import type { TranslationKeys } from "@/lib/i18n/types";
import { useTutorialContext } from "./tutorial-context";

const Joyride = dynamic(() => import("react-joyride").then((m) => m.Joyride), {
  ssr: false,
});

type TutorialProviderProps = {
  page: TutorialPage;
  steps: Step[];
  tutorialCompleted: boolean;
  onCompleted?: () => void;
};

export function TutorialProvider({ page, steps, tutorialCompleted, onCompleted }: TutorialProviderProps) {
  const [run, setRun] = useState(false);
  const { t } = useTranslation();
  const { setActivePage } = useTutorialContext();

  // Auto-start if tutorial not completed
  useEffect(() => {
    if (!tutorialCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
        setActivePage(page);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted, page, setActivePage]);

  // Clean up on unmount
  useEffect(() => {
    return () => setActivePage(null);
  }, [setActivePage]);

  const handleEvent = useCallback(
    async (data: EventData, _controls: Controls) => {
      const { status } = data;

      if (status === "finished" || status === "skipped") {
        setRun(false);
        setActivePage(null);
        onCompleted?.();
        try {
          await fetch("/api/me/tutorial", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "complete", page }),
          });
        } catch {
          // Silent fail — tutorial state is non-critical
        }
      }
    },
    [page, setActivePage, onCompleted],
  );

  // Translate step content using i18n keys
  const translatedSteps = steps.map((step) => ({
    ...step,
    content: t(step.content as keyof TranslationKeys),
  }));

  if (translatedSteps.length === 0) return null;

  return (
    <Joyride
      steps={translatedSteps}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: "#6366f1",
        overlayColor: "rgba(0, 0, 0, 0.45)",
        arrowColor: "#1e1e2e",
        backgroundColor: "#1e1e2e",
        textColor: "#e2e8f0",
        showProgress: true,
        skipBeacon: true,
        buttons: ["back", "close", "primary", "skip"],
        zIndex: 10000,
        spotlightRadius: 8,
      }}
      locale={{
        back: t("tutorial.btn.back" as keyof TranslationKeys),
        close: t("tutorial.btn.close" as keyof TranslationKeys),
        last: t("tutorial.btn.last" as keyof TranslationKeys),
        next: t("tutorial.btn.next" as keyof TranslationKeys),
        open: t("tutorial.btn.open" as keyof TranslationKeys),
        skip: t("tutorial.btn.skip" as keyof TranslationKeys),
        nextWithProgress: t("tutorial.btn.nextWithProgress" as keyof TranslationKeys),
      }}
    />
  );
}
