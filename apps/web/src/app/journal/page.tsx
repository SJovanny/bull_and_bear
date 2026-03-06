"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { TradeEntryModal } from "@/components/trade-entry-modal";

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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthBounds(anchor: Date) {
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  return { firstDay, gridStart };
}

function formatMonthYearUpper(date: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  return parts
    .map((part) => (part.type === "month" ? part.value.toUpperCase() : part.value))
    .join("");
}

function formatLongDateWithUpperMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  return parts
    .map((part) => (part.type === "month" ? part.value.toUpperCase() : part.value))
    .join("");
}

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalDate, setTradeModalDate] = useState<string>(() => toDateKey(new Date()));
  const [isEditTradeModalOpen, setIsEditTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);
  const [isDayPanelHighlighted, setIsDayPanelHighlighted] = useState(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    function syncAccountFromUrl() {
      const accountIdFromQuery = new URLSearchParams(window.location.search).get("accountId");
      setSelectedAccountId(accountIdFromQuery ?? "");
    }

    syncAccountFromUrl();
    window.addEventListener("bb-account-change", syncAccountFromUrl);
    window.addEventListener("popstate", syncAccountFromUrl);

    return () => {
      window.removeEventListener("bb-account-change", syncAccountFromUrl);
      window.removeEventListener("popstate", syncAccountFromUrl);
    };
  }, []);

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

    trades.forEach((trade) => {
      const key = toDateKey(new Date(trade.openedAt));
      const bucket = dayMap.get(key) ?? [];
      bucket.push(trade);
      dayMap.set(key, bucket);
    });

    dayMap.forEach((bucket) => bucket.sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1)));

    return dayMap;
  }, [trades]);

  const pnlByDay = useMemo(() => {
    const pnlMap = new Map<string, number>();

    trades.forEach((trade) => {
      const key = toDateKey(new Date(trade.openedAt));
      const current = pnlMap.get(key) ?? 0;
      pnlMap.set(key, current + Number(trade.netPnl ?? 0));
    });

    return pnlMap;
  }, [trades]);

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
    const confirmed = window.confirm(`Supprimer le trade ${trade.symbol} (${trade.side}) ?`);
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
      title="Journal de trading"
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mois precedent
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mois suivant
          </button>
        </>
      }
    >
      <div className="mx-auto w-full max-w-7xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">Calendrier</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{formatMonthYearUpper(firstDay)}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Chaque case affiche le nombre de trades. Clique un jour pour voir les trades en detail.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="journal-date-selector" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Date selector
                </label>
                <input
                  id="journal-date-selector"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => handleDateSelectorChange(event.target.value)}
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none ring-cyan-500 focus:ring-2"
                />
              </div>
            </div>
          </div>

          {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {loading ? <p className="mb-3 text-sm text-slate-500">Chargement du calendrier...</p> : null}

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const key = toDateKey(day);
              const tradeCount = tradesByDay.get(key)?.length ?? 0;
              const pnl = pnlByDay.get(key) ?? 0;
              const isCurrentMonth = day.getMonth() === firstDay.getMonth();
              const isSelected = key === selectedDate;

              let cellClass = isCurrentMonth
                ? "border-slate-200 bg-white hover:bg-slate-50"
                : "border-slate-100 bg-slate-50/50 text-slate-400";

              if (tradeCount > 0) {
                if (pnl > 0) {
                  cellClass = "border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-200";
                } else if (pnl < 0) {
                  cellClass = "border-rose-200 bg-rose-100 text-rose-900 hover:bg-rose-200";
                } else {
                  cellClass = "border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200";
                }
              }

              if (isSelected) {
                cellClass += " ring-2 ring-slate-800 ring-offset-1";
              }

              return (
                <div key={key} className={`relative rounded-xl border transition ${cellClass}`}>
                  <button
                    type="button"
                    onClick={() => handleCalendarDayClick(key)}
                    className="flex min-h-24 w-full flex-col px-2 py-2 text-left"
                  >
                    <p className="text-xs font-semibold">{day.getDate()}</p>

                    {tradeCount > 0 && (
                      <div className="mt-auto flex flex-col items-start gap-1">
                        <p className="inline-flex rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium">
                          {tradeCount} trade{tradeCount > 1 ? "s" : ""}
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
                      className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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
          className={`mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition ${
            isDayPanelHighlighted ? "ring-2 ring-cyan-400 ring-offset-1" : ""
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Jour selectionne</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {formatLongDateWithUpperMonth(new Date(`${selectedDate}T00:00:00`))}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => openTradeModal(selectedDate)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              + Ajouter
            </button>
          </div>

          {selectedDayTrades.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun trade sur ce jour.</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTrades.map((trade) => {
                const pnlValue = Number(trade.netPnl ?? 0);

                return (
                  <article
                    key={trade.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {trade.symbol} · {trade.side}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(trade.openedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {trade.status === "CLOSED" && trade.closedAt
                          ? ` -> ${new Date(trade.closedAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : " · OPEN"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          pnlValue >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {pnlValue > 0 ? "+" : ""}
                        {pnlValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>

                      <Link
                        href={`/trades/${trade.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-white"
                      >
                        Voir
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditTradeModal(trade)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-cyan-300 px-3 text-xs font-medium text-cyan-800 hover:bg-cyan-50"
                      >
                        Editer
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTrade(trade)}
                        disabled={deletingTradeId === trade.id}
                        aria-label={`Supprimer le trade ${trade.symbol}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
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
