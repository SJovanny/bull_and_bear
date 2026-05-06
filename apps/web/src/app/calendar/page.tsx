"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { TradeEntryModal } from "@/components/trade-entry-modal";
import { TradeImportModal } from "@/components/trade-import-modal";
import LoadingSpinner from "@/components/loading-spinner";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";
import { toDateKey, safeJsonArray } from "@/lib/format";
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

  // Trades board state
  const [boardSearch, setBoardSearch] = useState("");
  const [boardDateFrom, setBoardDateFrom] = useState("");
  const [boardDateTo, setBoardDateTo] = useState("");
  const [boardPage, setBoardPage] = useState(1);
  const BOARD_PAGE_SIZE = 10;

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

  // Trades board: filter to current month + search query
  const boardFilteredTrades = useMemo(() => {
    const monthTrades = (boardDateFrom || boardDateTo)
      ? displayTrades
      : displayTrades.filter((trade) => {
          const d = new Date(trade.openedAt);
          return d.getFullYear() === firstDay.getFullYear() && d.getMonth() === firstDay.getMonth();
        });

    const q = boardSearch.trim().toLowerCase();
    const afterTextFilter = q
      ? monthTrades.filter(
          (trade) =>
            trade.symbol.toLowerCase().includes(q) ||
            trade.side.toLowerCase().includes(q) ||
            toDateKey(new Date(trade.openedAt)).includes(q)
        )
      : monthTrades;

    return afterTextFilter.filter((trade) => {
      const dateKey = toDateKey(new Date(trade.openedAt));
      if (boardDateFrom && dateKey < boardDateFrom) return false;
      if (boardDateTo && dateKey > boardDateTo) return false;
      return true;
    });
  }, [displayTrades, firstDay, boardSearch, boardDateFrom, boardDateTo]);

  const boardTotalPages = Math.max(1, Math.ceil(boardFilteredTrades.length / BOARD_PAGE_SIZE));

  const boardPageTrades = useMemo(() => {
    const start = (boardPage - 1) * BOARD_PAGE_SIZE;
    return boardFilteredTrades.slice(start, start + BOARD_PAGE_SIZE);
  }, [boardFilteredTrades, boardPage, BOARD_PAGE_SIZE]);

  const loadTrades = useCallback(async () => {
    if (!tradesEndpoint) {
      setLoading(false);
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

  // Reset board page when month or filters change
  useEffect(() => {
    setBoardPage(1);
  }, [currentMonth, boardSearch, boardDateFrom, boardDateTo]);

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
            onClick={() => {
              if (selectedAccountId) {
                window.location.href = `/api/trades/export?accountId=${encodeURIComponent(selectedAccountId)}`;
              }
            }}
            disabled={!selectedAccountId}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 text-sm font-medium text-brand-600 hover:bg-brand-500/10 transition-colors font-sans disabled:opacity-50"
          >
            {t("calendar.exportCsv")}
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

        {/* ── Trades Board ── */}
        <section className="mt-4 rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4">
            {/* Board header row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500 font-sans">
                  {t("calendar.title")}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-primary font-sans">
                  {t("calendar.tradesBoard.title")}
                </h3>
                <p className="mt-0.5 text-sm text-secondary font-sans">
                  {boardFilteredTrades.length} {boardFilteredTrades.length === 1 ? t("common.trade") : t("common.trades")}
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t("calendar.tradesBoard.searchPlaceholder")}
                  value={boardSearch}
                  onChange={(e) => setBoardSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-primary placeholder:text-secondary outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
            </div>

            {/* Date range row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans shrink-0">
                  {t("calendar.tradesBoard.from")}
                </label>
                <input
                  type="date"
                  value={boardDateFrom}
                  max={boardDateTo || undefined}
                  onChange={(e) => setBoardDateFrom(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-surface-2 px-3 text-sm text-primary outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans shrink-0">
                  {t("calendar.tradesBoard.to")}
                </label>
                <input
                  type="date"
                  value={boardDateTo}
                  min={boardDateFrom || undefined}
                  onChange={(e) => setBoardDateTo(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-surface-2 px-3 text-sm text-primary outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
              {(boardDateFrom || boardDateTo) && (
                <button
                  type="button"
                  onClick={() => { setBoardDateFrom(""); setBoardDateTo(""); }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  {t("calendar.tradesBoard.clearDates")}
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-secondary font-sans">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t("calendar.tradesBoard.date")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("recentTrades.symbol")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("recentTrades.side")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("recentTrades.qty")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("recentTrades.netPnl")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("calendar.tradesBoard.status")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("calendar.tradesBoard.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-1">
                {boardPageTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-secondary font-sans text-sm">
                      {boardSearch ? t("calendar.tradesBoard.noResults") : t("calendar.tradesBoard.noTrades")}
                    </td>
                  </tr>
                ) : (
                  boardPageTrades.map((trade) => {
                    const pnlValue = Number(trade.netPnl ?? 0);
                    return (
                      <tr key={trade.id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3 text-secondary font-mono text-xs">
                          {toDateKey(new Date(trade.openedAt))}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary font-sans">{trade.symbol}</td>
                        <td className="px-4 py-3 text-secondary font-sans">{trade.side}</td>
                        <td className="px-4 py-3 text-secondary font-mono text-xs">
                          {Number(trade.quantity ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </td>
                        <td className={`px-4 py-3 font-medium font-mono text-xs ${pnlValue >= 0 ? "text-pnl-positive" : "text-pnl-negative"}`}>
                          {pnlValue > 0 ? "+" : ""}
                          {pnlValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold font-sans ${
                              trade.status === "OPEN"
                                ? "bg-brand-500/10 text-brand-500"
                                : "bg-surface-2 text-secondary"
                            }`}
                          >
                            {trade.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/trades/${trade.id}`}
                              className="inline-flex h-7 items-center justify-center rounded-lg border border-border px-2.5 text-xs font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans"
                            >
                              {t("calendar.view")}
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditTradeModal(trade)}
                              className="inline-flex h-7 items-center justify-center rounded-lg border border-brand-500/30 px-2.5 text-xs font-medium text-brand-500 hover:bg-brand-500/10 transition-colors font-sans"
                            >
                              {t("calendar.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTrade(trade)}
                              disabled={deletingTradeId === trade.id}
                              aria-label={`Delete trade ${trade.symbol}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-pnl-negative/30 text-pnl-negative hover:bg-pnl-negative/10 disabled:opacity-50 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {boardTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-secondary font-sans">
                {t("calendar.tradesBoard.page")} {boardPage} / {boardTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBoardPage((p) => Math.max(1, p - 1))}
                  disabled={boardPage === 1}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("calendar.tradesBoard.prevPage")}
                </button>
                <button
                  type="button"
                  onClick={() => setBoardPage((p) => Math.min(boardTotalPages, p + 1))}
                  disabled={boardPage === boardTotalPages}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("calendar.tradesBoard.nextPage")}
                </button>
              </div>
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
            confluences: safeJsonArray(editingTrade.confluences).length > 0 ? safeJsonArray(editingTrade.confluences) : null,
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
