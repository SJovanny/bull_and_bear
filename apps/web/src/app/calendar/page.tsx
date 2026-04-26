"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { TradeEntryModal } from "@/components/trade-entry-modal";
import { TradeImportModal } from "@/components/trade-import-modal";
import LoadingSpinner from "@/components/loading-spinner";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";
import { toDateKey } from "@/lib/format";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import { mockCalendarTrades } from "@/config/tutorial-mock-data";

type Trade = {
  id: string;
  accountId: string;
  symbol: string;
  assetClass: "STOCK" | "FUTURES" | "FOREX" | "CRYPTO" | "OPTIONS" | "ETF" | "INDEX" | "CFD" | "OTHER";
  side: "LONG" | "SHORT";
  quantity: string;
  entryPrice: string;
  initialStopLoss: string | null;
  initialTakeProfit: string | null;
  riskAmount: string | null;
  contractMultiplier: string;
  exitPrice: string | null;
  fees: string;
  openedAt: string;
  closedAt: string | null;
  status: "OPEN" | "CLOSED";
  setupName: string | null;
  entryTimeframe: string | null;
  higherTimeframeBias: string | null;
  strategyTag: string | null;
  confluences: string[] | null;
  emotionalState: string | null;
  executionRating: number | null;
  planFollowed: boolean | null;
  entryReason: string | null;
  exitReason: string | null;
  lessonLearned: string | null;
  chartScreenshots: string[] | null;
  notes: string | null;
  netPnl: string | null;
};

function monthBounds(anchor: Date) {
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  return { firstDay, gridStart };
}

function formatMonthYearUpper(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  return parts
    .map((part) => (part.type === "month" ? part.value.toUpperCase() : part.value))
    .join("");
}

function formatLongDateWithUpperMonth(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  return parts
    .map((part) => (part.type === "month" ? part.value.toUpperCase() : part.value))
    .join("");
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageContent />
    </Suspense>
  );
}

function CalendarPageContent() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [tradeModalDate, setTradeModalDate] = useState<string>(() => toDateKey(new Date()));
  const [isEditTradeModalOpen, setIsEditTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);
  const [isDayPanelHighlighted, setIsDayPanelHighlighted] = useState(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedAccountId = useSelectedAccountId();
  const { t, locale } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded, markCompleted } = useTutorialStatus();

  // Inject mock data when tutorial hasn't been completed and no real trades
  const shouldUseMock = tutorialLoaded && tutorialsCompleted.calendar !== true && !loading;
  const displayTrades = shouldUseMock ? (mockCalendarTrades as Trade[]) : trades;

  const tradesEndpoint = useMemo(() => {
    if (!selectedAccountId) {
      return null;
    }

    return `/api/trades?accountId=${encodeURIComponent(selectedAccountId)}`;
  }, [selectedAccountId]);

  const { firstDay, gridStart } = useMemo(() => monthBounds(currentMonth), [currentMonth]);

  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [gridStart]);

  const tradesByDay = useMemo(() => {
    const dayMap = new Map<string, Trade[]>();

    displayTrades.forEach((trade) => {
      const key = toDateKey(new Date(trade.openedAt));
      const bucket = dayMap.get(key) ?? [];
      bucket.push(trade);
      dayMap.set(key, bucket);
    });

    dayMap.forEach((bucket) => bucket.sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1)));

    return dayMap;
  }, [displayTrades]);

  const pnlByDay = useMemo(() => {
    const pnlMap = new Map<string, number>();

    displayTrades.forEach((trade) => {
      const key = toDateKey(new Date(trade.openedAt));
      const current = pnlMap.get(key) ?? 0;
      pnlMap.set(key, current + Number(trade.netPnl ?? 0));
    });

    return pnlMap;
  }, [displayTrades]);

  const selectedDayTrades = useMemo(() => {
    return tradesByDay.get(selectedDate) ?? [];
  }, [tradesByDay, selectedDate]);

  const loadTrades = useCallback(async () => {
    if (!tradesEndpoint) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(tradesEndpoint);
      const payload = (await response.json()) as { trades?: Trade[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load trades");
      }

      setTrades(payload.trades ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [tradesEndpoint]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  function openTradeModal(dateKey: string) {
    setTradeModalDate(dateKey);
    setIsTradeModalOpen(true);
  }

  function handleDateSelectorChange(dateKey: string) {
    if (!dateKey) {
      return;
    }

    const [yearStr, monthStr, dayStr] = dateKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return;
    }

    setSelectedDate(dateKey);
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function openEditTradeModal(trade: Trade) {
    setEditingTrade(trade);
    setIsEditTradeModalOpen(true);
  }

  async function deleteTrade(trade: Trade) {
    const confirmed = window.confirm(`${t("calendar.deleteConfirm")} ${trade.symbol} (${trade.side}) ?`);
    if (!confirmed) {
      return;
    }

    setDeletingTradeId(trade.id);
    setError(null);

    try {
      const response = await fetch(`/api/trades/${trade.id}`, { method: "DELETE" });

      if (!response.ok && response.status !== 204) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not delete trade");
      }

      if (editingTrade?.id === trade.id) {
        setIsEditTradeModalOpen(false);
        setEditingTrade(null);
      }

      await loadTrades();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setDeletingTradeId(null);
    }
  }

  function handleCalendarDayClick(dateKey: string) {
    setSelectedDate(dateKey);
    setIsDayPanelHighlighted(true);

    requestAnimationFrame(() => {
      document.getElementById("selected-day-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    setTimeout(() => setIsDayPanelHighlighted(false), 800);
  }

  return (
    <DashboardShell
      title={t("calendar.title")}
      actions={
        <div className="flex flex-wrap gap-2" data-tutorial="calendar-actions">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 text-sm font-medium text-brand-600 hover:bg-brand-500/10 transition-colors font-sans"
          >
            {t("calendar.importTrades")}
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-secondary hover:bg-surface-2 transition-colors font-sans"
          >
            {t("calendar.prevMonth")}
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-secondary hover:bg-surface-2 transition-colors font-sans"
          >
            {t("calendar.nextMonth")}
          </button>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl">
        {tutorialLoaded && (
          <TutorialProvider
            page="calendar"
            steps={tutorialStepsMap.calendar}
            tutorialCompleted={tutorialsCompleted.calendar === true}
            onCompleted={() => markCompleted("calendar")}
          />
        )}
        <section className="rounded-2xl border border-border bg-surface-1 p-3 sm:p-6 shadow-sm">
          <div className="mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500 font-sans">{t("calendar.title")}</p>
                <h2 className="mt-2 text-2xl font-semibold text-primary font-sans">{formatMonthYearUpper(firstDay, locale)}</h2>
                <p className="mt-1 text-sm text-secondary font-sans">
                  {t("calendar.description")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="journal-date-selector" className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">
                  {t("calendar.date")}
                </label>
                <input
                  id="journal-date-selector"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => handleDateSelectorChange(event.target.value)}
                  className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm text-primary outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
            </div>
          </div>

          {error ? <p className="mb-3 rounded-lg bg-pnl-negative/10 px-3 py-2 text-sm text-pnl-negative font-sans">{error}</p> : null}
          {loading && !shouldUseMock ? <LoadingSpinner /> : null}

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
            {[t("calendar.days.mon"), t("calendar.days.tue"), t("calendar.days.wed"), t("calendar.days.thu"), t("calendar.days.fri"), t("calendar.days.sat"), t("calendar.days.sun")].map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2" data-tutorial="calendar-grid">
            {calendarDays.map((day) => {
              const key = toDateKey(day);
              const tradeCount = tradesByDay.get(key)?.length ?? 0;
              const pnl = pnlByDay.get(key) ?? 0;
              const isCurrentMonth = day.getMonth() === firstDay.getMonth();
              const isSelected = key === selectedDate;

              let cellClass = isCurrentMonth
                ? "border-border bg-surface-1 hover:bg-surface-2"
                : "border-border/40 bg-surface-2/40 text-secondary/50";

              if (tradeCount > 0) {
                if (pnl > 0) {
                  cellClass = "border-pnl-positive/30 bg-pnl-positive/10 text-pnl-positive hover:bg-pnl-positive/20";
                } else if (pnl < 0) {
                  cellClass = "border-pnl-negative/30 bg-pnl-negative/10 text-pnl-negative hover:bg-pnl-negative/20";
                } else {
                  cellClass = "border-border bg-surface-2 text-primary hover:bg-surface-2";
                }
              }

              if (isSelected) {
                cellClass += " ring-2 ring-brand-500 ring-offset-1";
              }

              return (
                <div key={key} className={`relative rounded-xl border transition ${cellClass}`}>
                  <button
                    type="button"
                    onClick={() => handleCalendarDayClick(key)}
                    className="flex min-h-16 sm:min-h-24 w-full flex-col px-1.5 py-1.5 sm:px-2 sm:py-2 text-left"
                  >
                    <p className="text-xs font-semibold">{day.getDate()}</p>

                    {tradeCount > 0 && (
                      <div className="mt-auto flex flex-col items-start gap-1">
                        <p className="inline-flex rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium">
                          {tradeCount} {tradeCount > 1 ? t("common.trades") : t("common.trade")}
                        </p>
                        <p className="inline-flex rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium">
                          {pnl > 0 ? "+" : ""}
                          {pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </button>

                  {isCurrentMonth ? (
                    <button
                      type="button"
                      onClick={() => openTradeModal(key)}
                      aria-label={`Ajouter un trade le ${key}`}
                      className="absolute right-1 top-1 inline-flex items-center justify-center text-sm leading-none font-semibold text-secondary hover:text-primary"
                    >
                      +
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="selected-day-panel"
          className={`mt-4 rounded-2xl border border-border bg-surface-1 p-6 shadow-sm transition ${
            isDayPanelHighlighted ? "ring-2 ring-brand-500 ring-offset-1" : ""
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary font-sans">{t("calendar.selectedDay")}</p>
              <h3 className="mt-1 text-lg font-semibold text-primary font-sans">
                {formatLongDateWithUpperMonth(new Date(`${selectedDate}T00:00:00`), locale)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => openTradeModal(selectedDate)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans"
            >
              {t("calendar.addTrade")}
            </button>
          </div>

          {selectedDayTrades.length === 0 ? (
            <p className="text-sm text-secondary font-sans">{t("calendar.noTrades")}</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTrades.map((trade) => {
                const pnlValue = Number(trade.netPnl ?? 0);

                return (
                  <article
                    key={trade.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary font-sans">
                        {trade.symbol} · {trade.side}
                      </p>
                      <p className="text-xs text-secondary font-sans">
                        {new Date(trade.openedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {trade.status === "CLOSED" && trade.closedAt
                          ? ` → ${new Date(trade.closedAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : " · OPEN"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold font-mono ${
                          pnlValue >= 0
                            ? "bg-pnl-positive/10 text-pnl-positive"
                            : "bg-pnl-negative/10 text-pnl-negative"
                        }`}
                      >
                        {pnlValue > 0 ? "+" : ""}
                        {pnlValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>

                      <Link
                        href={`/trades/${trade.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-secondary hover:bg-surface-1 hover:text-primary transition-colors font-sans"
                      >
                        {t("calendar.view")}
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditTradeModal(trade)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-brand-500/30 px-3 text-xs font-medium text-brand-500 hover:bg-brand-500/10 transition-colors font-sans"
                      >
                        {t("calendar.edit")}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTrade(trade)}
                        disabled={deletingTradeId === trade.id}
                        aria-label={`Supprimer le trade ${trade.symbol}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-pnl-negative/30 text-pnl-negative hover:bg-pnl-negative/10 disabled:opacity-50 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <TradeEntryModal
        isOpen={isTradeModalOpen}
        initialDate={tradeModalDate}
        onClose={() => setIsTradeModalOpen(false)}
        onCreated={loadTrades}
      />

      <TradeImportModal
        isOpen={isImportModalOpen}
        accountId={selectedAccountId}
        onClose={() => setIsImportModalOpen(false)}
        onImported={loadTrades}
      />

      {editingTrade ? (
        <TradeEntryModal
          isOpen={isEditTradeModalOpen}
          initialDate={editingTrade.openedAt.slice(0, 10)}
          mode="edit"
          tradeId={editingTrade.id}
          initialTrade={{
            accountId: editingTrade.accountId,
            assetClass: editingTrade.assetClass,
            symbol: editingTrade.symbol,
            side: editingTrade.side,
            quantity: editingTrade.quantity,
            openedAt: editingTrade.openedAt,
            entryPrice: editingTrade.entryPrice,
            initialStopLoss: editingTrade.initialStopLoss,
            initialTakeProfit: editingTrade.initialTakeProfit,
            riskAmount: editingTrade.riskAmount,
            contractMultiplier: editingTrade.contractMultiplier,
            status: editingTrade.status,
            closedAt: editingTrade.closedAt,
            exitPrice: editingTrade.exitPrice,
            fees: editingTrade.fees,
            netPnl: editingTrade.netPnl,
            setupName: editingTrade.setupName,
            entryTimeframe: editingTrade.entryTimeframe,
            higherTimeframeBias: editingTrade.higherTimeframeBias,
            strategyTag: editingTrade.strategyTag,
            confluences: editingTrade.confluences,
            emotionalState: editingTrade.emotionalState,
            executionRating: editingTrade.executionRating,
            planFollowed: editingTrade.planFollowed,
            entryReason: editingTrade.entryReason,
            exitReason: editingTrade.exitReason,
            lessonLearned: editingTrade.lessonLearned,
            chartScreenshots: editingTrade.chartScreenshots,
            notes: editingTrade.notes,
          }}
          onClose={() => {
            setIsEditTradeModalOpen(false);
            setEditingTrade(null);
          }}
          onSaved={loadTrades}
        />
      ) : null}
    </DashboardShell>
  );
}
