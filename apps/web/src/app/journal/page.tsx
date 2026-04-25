"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { JournalEntryModal } from "@/components/journal-entry-modal";
import { compactPnl, pnlColorClass } from "@/lib/format";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";
import { mentalStateLabelKeys } from "@/lib/journal-labels";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import { mockTrades, mockJournalEntries } from "@/config/tutorial-mock-data";
import type { Trade } from "@/types";

type JournalEntry = {
  id: string;
  date: string;
  economicEvents: string | null;
  marketConditions: string | null;
  keyLevels: string | null;
  strategiesFocus: string[] | null;
  executionRating: number | null;
  mentalState: string[] | null;
  mistakes: string[] | null;
  lessonsLearned: string | null;
  notes: string | null;
};

type DaySummary = {
  dateStr: string;
  dateObj: Date;
  pnl: number;
  tradeCount: number;
  journal: JournalEntry | null;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function formatMonthYearUpper(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  return parts.map((part) => (part.type === "month" ? part.value.toUpperCase() : part.value)).join("");
}

export default function JournalPage() {
  return (
    <Suspense>
      <JournalPageContent />
    </Suspense>
  );
}

function JournalPageContent() {
  const selectedAccountId = useSelectedAccountId();
  const { t, locale } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded } = useTutorialStatus();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  const loadData = useCallback(async () => {
    if (!selectedAccountId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [tradesRes, journalsRes] = await Promise.all([
        fetch(`/api/trades?accountId=${selectedAccountId}`),
        fetch(`/api/journals?accountId=${selectedAccountId}`),
      ]);

      const tradesPayload = await tradesRes.json();
      if (!tradesRes.ok) {
        throw new Error(tradesPayload.error || t("journalModal.loadTradesError"));
      }
      setTrades(tradesPayload.trades || []);

      if (journalsRes.ok) {
        const journalsPayload = await journalsRes.json();
        setJournals(journalsPayload.journals || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("journalModal.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Inject mock data when tutorial hasn't been completed
  const shouldUseMock = tutorialLoaded && tutorialsCompleted.journal !== true && !loading;
  const displayTrades = shouldUseMock ? (mockTrades as Trade[]) : trades;
  const displayJournals = shouldUseMock ? (mockJournalEntries as JournalEntry[]) : journals;

  const monthSummaries = useMemo(() => {
    const dayMap = new Map<string, DaySummary>();

    displayTrades.forEach((trade) => {
      const tradeDate = new Date(trade.openedAt);
      if (!isSameMonth(tradeDate, selectedMonth)) {
        return;
      }

      const key = toDateKey(tradeDate);
      const current = dayMap.get(key) || {
        dateStr: key,
        dateObj: new Date(`${key}T12:00:00`),
        pnl: 0,
        tradeCount: 0,
        journal: null,
      };

      current.pnl += Number(trade.netPnl ?? 0);
      current.tradeCount += 1;
      dayMap.set(key, current);
    });

    displayJournals.forEach((journal) => {
      const journalDate = new Date(journal.date);
      if (!isSameMonth(journalDate, selectedMonth)) {
        return;
      }

      const key = journalDate.toISOString().slice(0, 10);
      const current = dayMap.get(key) || {
        dateStr: key,
        dateObj: new Date(`${key}T12:00:00`),
        pnl: 0,
        tradeCount: 0,
        journal: null,
      };

      current.journal = journal;
      dayMap.set(key, current);
    });

    return Array.from(dayMap.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [displayJournals, selectedMonth, displayTrades]);

  function handleOpenModal(dateKey?: string) {
    if (dateKey) {
      setSelectedDate(dateKey);
    } else {
      const today = new Date();
      setSelectedDate(toDateKey(isSameMonth(selectedMonth, today) ? today : selectedMonth));
    }

    setIsModalOpen(true);
  }

  const isCurrentMonth = isSameMonth(selectedMonth, new Date());
  const selectedMonthLabel = formatMonthYearUpper(selectedMonth, locale);

  return (
    <DashboardShell
      title={t("journal.title")}
      actions={
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 font-sans"
          data-tutorial="journal-actions"
        >
          {t("journal.newEntry")}
        </button>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-12">
        {tutorialLoaded && (
          <TutorialProvider
            page="journal"
            steps={tutorialStepsMap.journal}
            tutorialCompleted={tutorialsCompleted.journal === true}
          />
        )}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-1 px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedMonth((current) => addMonths(current, -1))}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-primary transition hover:bg-surface-2 font-sans"
          >
            {t("calendar.prevMonth")}
          </button>

          <div className="text-center">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">{t("calendar.date")}</p>
            <h2 className="mt-1 font-sans text-lg font-bold text-primary sm:text-xl">{selectedMonthLabel}</h2>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth((current) => addMonths(current, 1))}
            disabled={isCurrentMonth}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-primary transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent font-sans"
          >
            {t("calendar.nextMonth")}
          </button>
        </div>

        {error ? <div className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 font-sans text-sm text-pnl-negative">{error}</div> : null}

        {loading && monthSummaries.length === 0 ? (
          <div className="flex items-center justify-center py-20 font-sans text-secondary animate-pulse">{t("journal.loading")}</div>
        ) : null}

        {!loading && monthSummaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-12 text-center shadow-sm">
            <h3 className="font-sans text-lg font-bold text-primary">{t("journal.emptyTitle")}</h3>
            <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-secondary">{t("journal.emptyDesc")}</p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 font-sans"
            >
              {t("journal.emptyAction")}
            </button>
          </div>
        ) : null}

        {monthSummaries.length > 0 ? (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="font-sans text-xs font-bold tracking-[0.2em] text-secondary">{selectedMonthLabel}</h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-tutorial="journal-list">
              {monthSummaries.map((day) => {
                const previewNote = day.journal?.notes
                  ? (day.journal.notes.length > 80 ? `${day.journal.notes.substring(0, 80)}...` : day.journal.notes)
                  : t("journal.noNote");

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => handleOpenModal(day.dateStr)}
                    className="group relative flex min-h-[160px] flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
                  >
                    <div className="mb-4 flex w-full items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-secondary">
                          {day.dateObj.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { weekday: "short" })}
                        </span>
                        <p className="font-sans text-xl font-black leading-none text-primary">{day.dateObj.getDate()}</p>
                      </div>

                      {day.tradeCount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className={`font-mono text-sm font-bold tracking-tight ${pnlColorClass(day.pnl)}`}>
                            {day.pnl > 0 ? "+" : ""}
                            {compactPnl(day.pnl)}
                          </span>
                          <span className="font-sans text-[10px] font-semibold uppercase text-secondary">
                            {day.tradeCount} {day.tradeCount > 1 ? t("common.trades") : t("common.trade")}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-4 flex min-h-[24px] flex-wrap gap-1.5">
                      {day.journal?.executionRating ? (
                        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          * {day.journal.executionRating}/5
                        </span>
                      ) : null}

                      {Array.isArray(day.journal?.mentalState) && day.journal.mentalState.length > 0
                        ? day.journal.mentalState.slice(0, 2).map((state, index) => (
                            <span key={index} className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                              {Object.prototype.hasOwnProperty.call(mentalStateLabelKeys, state)
                                ? t(mentalStateLabelKeys[state as keyof typeof mentalStateLabelKeys])
                                : state}
                            </span>
                          ))
                        : null}
                    </div>

                    <div className="mt-auto border-t border-border pt-3">
                      <p className={`font-sans text-xs leading-relaxed ${day.journal?.notes ? "text-primary" : "italic text-secondary"}`}>
                        &quot;{previewNote}&quot;
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <JournalEntryModal
        isOpen={isModalOpen}
        dateStr={selectedDate}
        accountId={selectedAccountId}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
      />
    </DashboardShell>
  );
}
