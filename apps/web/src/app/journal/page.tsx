"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { JournalEntryModal } from "@/components/journal-entry-modal";
import { formatNumber, compactPnl, pnlColorClass, pnlBgClass } from "@/lib/format";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";
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

function formatMonthYearUpper(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" }).formatToParts(date);
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const { t, locale } = useTranslation();

  const loadData = useCallback(async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    setError(null);
    try {
      const [tradesRes, journalsRes] = await Promise.all([
        fetch(`/api/trades?accountId=${selectedAccountId}`),
        fetch(`/api/journals?accountId=${selectedAccountId}`) // Needs backend route or we fetch individual days (we need a list route)
      ]);
      
      const tradesPayload = await tradesRes.json();
      if (!tradesRes.ok) throw new Error(tradesPayload.error || "Failed to load trades");
      setTrades(tradesPayload.trades || []);

      // Fake journals if the backend list route doesn't exist yet (will build that next)
      if (journalsRes.ok) {
         const journalsPayload = await journalsRes.json();
         setJournals(journalsPayload.journals || []);
      }
      
      } catch (err: unknown) {
        if (err instanceof Error) {
           setError(err.message);
        } else {
           setError("Unknown error");
        }
      } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summariesByMonth = useMemo(() => {
    const dayMap = new Map<string, DaySummary>();

    // 1. Map trades
    trades.forEach((trade) => {
      const key = toDateKey(new Date(trade.openedAt));
      const pnl = Number(trade.netPnl ?? 0);
      const current = dayMap.get(key) || { dateStr: key, dateObj: new Date(`${key}T12:00:00`), pnl: 0, tradeCount: 0, journal: null };
      current.pnl += pnl;
      current.tradeCount += 1;
      dayMap.set(key, current);
    });

    // 2. Map journals
    journals.forEach((journal) => {
      const key = new Date(journal.date).toISOString().slice(0, 10);
      const current = dayMap.get(key) || { dateStr: key, dateObj: new Date(`${key}T12:00:00`), pnl: 0, tradeCount: 0, journal: null };
      current.journal = journal;
      dayMap.set(key, current);
    });

    // Sort descending
    const sortedDays = Array.from(dayMap.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

    // Group by month string (e.g. "MARS 2026")
    const grouped = new Map<string, DaySummary[]>();
    sortedDays.forEach(day => {
       const monthStr = formatMonthYearUpper(day.dateObj, locale);
       const bucket = grouped.get(monthStr) || [];
       bucket.push(day);
       grouped.set(monthStr, bucket);
    });

    return grouped;
  }, [trades, journals]);

  function handleOpenModal(dateKey?: string) {
    if (dateKey) {
      setSelectedDate(dateKey);
    } else {
      setSelectedDate(toDateKey(new Date()));
    }
    setIsModalOpen(true);
  }

  return (
    <DashboardShell 
      title={t("journal.title")} 
      actions={
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 font-sans"
        >
          {t("journal.newEntry")}
        </button>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-12">
        
        {error ? <div className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">{error}</div> : null}
        
        {loading && summariesByMonth.size === 0 ? (
          <div className="flex items-center justify-center py-20 text-secondary font-sans animate-pulse">
            {t("journal.loading")}
          </div>
        ) : null}

        {!loading && summariesByMonth.size === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-primary font-sans">{t("journal.emptyTitle")}</h3>
            <p className="mt-2 text-sm text-secondary font-sans max-w-sm mx-auto">{t("journal.emptyDesc")}</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 font-sans"
            >
              {t("journal.emptyAction")}
            </button>
          </div>
        ) : null}

        {Array.from(summariesByMonth.entries()).map(([monthName, days]) => (
          <section key={monthName} className="space-y-6">
            
            {/* Month Separator */}
            <div className="flex items-center gap-4">
               <h2 className="text-xs font-bold tracking-[0.2em] text-secondary font-sans">{monthName}</h2>
               <div className="h-px flex-1 bg-border/60"></div>
            </div>

            {/* Flashcards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {days.map((day) => {
                
                // Truncate notes
                const previewNote = day.journal?.notes 
                  ? (day.journal.notes.length > 80 ? day.journal.notes.substring(0, 80) + "..." : day.journal.notes)
                  : t("journal.noNote");

                return (
                  <button
                    key={day.dateStr}
                    onClick={() => handleOpenModal(day.dateStr)}
                    className="group relative flex min-h-[160px] flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md text-left"
                  >
                    {/* Header: Date + PnL */}
                    <div className="flex items-start justify-between w-full mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-sans">
                          {day.dateObj.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { weekday: "short" })}
                        </span>
                        <p className="text-xl font-black text-primary font-sans leading-none">{day.dateObj.getDate()}</p>
                      </div>
                      
                      {day.tradeCount > 0 && (
                        <div className={`flex flex-col items-end`}>
                          <span className={`text-sm font-bold font-mono tracking-tight ${pnlColorClass(day.pnl)}`}>
                            {day.pnl > 0 ? "+" : ""}{compactPnl(day.pnl)}
                          </span>
                          <span className="text-[10px] font-semibold text-secondary uppercase font-sans">
                            {day.tradeCount} {day.tradeCount > 1 ? t("common.trades") : t("common.trade")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Tags / Execution */}
                    <div className="mb-4 flex flex-wrap gap-1.5 min-h-[24px]">
                      {day.journal?.executionRating ? (
                        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                           ★ {day.journal.executionRating}/5
                        </span>
                      ) : null}
                      
                      {Array.isArray(day.journal?.mentalState) && day.journal!.mentalState.length > 0 ? (
                        day.journal!.mentalState.slice(0, 2).map((state, i) => (
                           <span key={i} className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                             {state}
                           </span>
                        ))
                      ) : null}
                    </div>

                    {/* Bottom: Note preview */}
                    <div className="mt-auto border-t border-border pt-3">
                      <p className={`text-xs leading-relaxed font-sans ${day.journal?.notes ? "text-primary" : "text-secondary italic"}`}>
                        &quot;{previewNote}&quot;
                      </p>
                    </div>

                  </button>
                );
              })}
            </div>
          </section>
        ))}

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
