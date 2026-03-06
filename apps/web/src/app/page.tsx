"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

type Account = {
  id: string;
  name: string;
  currency: string;
};

type Trade = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: string;
  entryPrice: string;
  exitPrice: string | null;
  status: string;
  openedAt: string;
  netPnl: string | null;
};

type DashboardPeriod = "7D" | "30D" | "YTD" | "ALL";

function formatNumber(value: number, fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits });
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthBounds(anchor: Date) {
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  return { firstDay, gridStart };
}

function dayClass(value: number) {
  if (value > 0) return "bg-emerald-100 border-emerald-200 text-emerald-900";
  if (value < 0) return "bg-rose-100 border-rose-200 text-rose-900";
  return "bg-slate-100 border-slate-200 text-slate-700";
}

function sparklinePoints(values: number[], width = 420, height = 130) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function compactPnl(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return "0";
  }

  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${value > 0 ? "+" : "-"}${(abs / 1000).toFixed(1)}k`;
  }

  return `${value > 0 ? "+" : ""}${formatNumber(value, 0)}`;
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("30D");
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

  useEffect(() => {
    async function loadData() {
      if (!tradesEndpoint) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [accountsResponse, tradesResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch(tradesEndpoint),
        ]);

        const accountPayload = (await accountsResponse.json()) as { accounts?: Account[]; error?: string };
        const tradePayload = (await tradesResponse.json()) as { trades?: Trade[]; error?: string };

        if (!accountsResponse.ok) {
          throw new Error(accountPayload.error ?? "Could not load accounts");
        }

        if (!tradesResponse.ok) {
          throw new Error(tradePayload.error ?? "Could not load trades");
        }

        setAccounts(accountPayload.accounts ?? []);
        setTrades(tradePayload.trades ?? []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [tradesEndpoint]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const filteredTrades = useMemo(() => {
    if (period === "ALL") {
      return trades;
    }

    const now = new Date();
    let threshold = new Date(0);

    if (period === "7D") {
      threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30D") {
      threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      threshold = new Date(now.getFullYear(), 0, 1);
    }

    return trades.filter((trade) => new Date(trade.openedAt) >= threshold);
  }, [trades, period]);

  const { totalTrades, openTrades, closedTrades, totalNetPnl, winRate, profitFactor, equityCurve, last14Days, monthPnlByDay } =
    useMemo(() => {
      const parsed = filteredTrades.map((trade) => ({
        ...trade,
        pnl: Number(trade.netPnl ?? 0),
      }));

      const totalTradesValue = parsed.length;
      const openTradesValue = parsed.filter((trade) => trade.status === "OPEN").length;
      const closedTradesList = parsed.filter((trade) => trade.status === "CLOSED");
      const closedTradesValue = closedTradesList.length;

      const totalPnl = parsed.reduce((sum, trade) => sum + trade.pnl, 0);
      const winners = closedTradesList.filter((trade) => trade.pnl > 0);
      const losers = closedTradesList.filter((trade) => trade.pnl < 0);
      const grossProfit = winners.reduce((sum, trade) => sum + trade.pnl, 0);
      const grossLossAbs = Math.abs(losers.reduce((sum, trade) => sum + trade.pnl, 0));
      const winRateValue = closedTradesValue === 0 ? 0 : (winners.length / closedTradesValue) * 100;

      let profitFactorValue = 0;
      if (grossLossAbs === 0) {
        profitFactorValue = grossProfit > 0 ? Number.POSITIVE_INFINITY : 0;
      } else {
        profitFactorValue = grossProfit / grossLossAbs;
      }

      const sortedByDate = [...parsed].sort((a, b) => (a.openedAt > b.openedAt ? 1 : -1));
      let cumulative = 0;
      const equity = sortedByDate.map((trade) => {
        cumulative += trade.pnl;
        return cumulative;
      });

      const dailyMap = new Map<string, number>();
      parsed.forEach((trade) => {
        const key = toDateKey(new Date(trade.openedAt));
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + trade.pnl);
      });

      const last14 = [...dailyMap.entries()]
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .slice(0, 14)
        .reverse()
        .map(([date, pnl]) => ({ date, pnl }));

      const monthMap = new Map<string, number>();
      parsed.forEach((trade) => {
        const date = new Date(trade.openedAt);
        if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
          return;
        }

        const key = toDateKey(date);
        monthMap.set(key, (monthMap.get(key) ?? 0) + trade.pnl);
      });

      return {
        totalTrades: totalTradesValue,
        openTrades: openTradesValue,
        closedTrades: closedTradesValue,
        totalNetPnl: totalPnl,
        winRate: winRateValue,
        profitFactor: profitFactorValue,
        equityCurve: equity,
        last14Days: last14,
        monthPnlByDay: monthMap,
      };
    }, [filteredTrades, currentMonth]);

  const { firstDay, gridStart } = useMemo(() => monthBounds(currentMonth), [currentMonth]);

  const miniCalendarDays = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [gridStart]);

  const maxAbs14d = useMemo(() => {
    return Math.max(1, ...last14Days.map((day) => Math.abs(day.pnl)));
  }, [last14Days]);

  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Interface pro de performance trading"
    >
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {(["7D", "30D", "YTD", "ALL"] as DashboardPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-semibold tracking-[0.08em] transition ${
                  period === item
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}. Verify you are authenticated with Supabase, then refresh.
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {/* Net PnL — featured dark card */}
          <article className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 shadow-lg ring-1 ring-white/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Net PnL</p>
            <p
              className={`mt-3 text-4xl font-black tabular-nums leading-none tracking-tight ${
                totalNetPnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {loading ? (
                <span className="text-slate-600">—</span>
              ) : (
                (totalNetPnl > 0 ? "+" : "") + formatNumber(totalNetPnl)
              )}
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                totalNetPnl >= 0
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              <span>{totalNetPnl >= 0 ? "▲" : "▼"}</span>
              <span>{totalNetPnl >= 0 ? "Profit" : "Loss"}</span>
            </div>
          </article>

          {/* Win Rate — circular gauge */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Win Rate</p>
            <div className="mt-2 flex items-center justify-center">
              <div className="relative h-28 w-28">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="wr-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="28" r="23" stroke="#e2e8f0" strokeWidth="4.5" fill="none" />
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    stroke="url(#wr-grad)"
                    strokeWidth="4.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(winRate / 100) * 144.51} 144.51`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <p className="text-2xl font-black tabular-nums leading-none text-slate-900">
                    {loading ? "—" : `${formatNumber(winRate, 1)}%`}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">rate</p>
                </div>
              </div>
            </div>
          </article>

          {/* Profit Factor */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Profit Factor</p>
            <p
              className={`mt-3 text-4xl font-black tabular-nums leading-none tracking-tight ${
                profitFactor >= 1 ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {loading ? "—" : Number.isFinite(profitFactor) ? formatNumber(profitFactor) : "∞"}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profitFactor >= 1 ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min((profitFactor / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-slate-400">Target ≥ 1.5</p>
          </article>

          {/* Total Trades */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total Trades</p>
            <p className="mt-3 text-4xl font-black tabular-nums leading-none tracking-tight text-slate-900">
              {loading ? "—" : totalTrades}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {closedTrades} closed
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {openTrades} open
              </span>
            </div>
          </article>

          {/* Open / Closed */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Open / Closed</p>
            <div className="mt-3 flex items-end gap-3">
              <div>
                <p className="text-4xl font-black tabular-nums leading-none tracking-tight text-amber-500">
                  {loading ? "—" : openTrades}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Open</p>
              </div>
              <span className="mb-5 text-xl font-light text-slate-200">/</span>
              <div>
                <p className="text-4xl font-black tabular-nums leading-none tracking-tight text-slate-700">
                  {loading ? "—" : closedTrades}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Closed</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-700"
                style={{ width: totalTrades > 0 ? `${(openTrades / totalTrades) * 100}%` : "0%" }}
              />
            </div>
          </article>
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Cumulative PnL</h2>
              <span className="text-xs text-slate-500">{totalTrades} trades · {period}</span>
            </div>
            <svg viewBox="0 0 420 130" className="h-40 w-full rounded-lg bg-slate-50 p-2">
              <polyline
                points={sparklinePoints(equityCurve)}
                fill="none"
                stroke={totalNetPnl >= 0 ? "#059669" : "#e11d48"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-xs text-slate-500">Open/Closed: {openTrades}/{closedTrades} · Accounts: {accounts.length}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Daily Net PnL (14d)</h2>
            </div>
            <div className="flex h-40 items-end gap-1 rounded-lg bg-slate-50 px-2 py-2">
              {last14Days.length === 0 ? (
                <p className="m-auto text-xs text-slate-500">No data yet</p>
              ) : (
                last14Days.map((item) => {
                  const height = Math.max(10, (Math.abs(item.pnl) / maxAbs14d) * 120);
                  return (
                    <div key={item.date} className="flex flex-1 flex-col items-center justify-end gap-1">
                      <div
                        className={`w-full rounded-sm ${item.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                        style={{ height: `${height}px` }}
                        title={`${item.date}: ${formatNumber(item.pnl)}`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-3 xl:grid-cols-[0.55fr_1.45fr]">
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Recent trades</h2>
            </div>

            <div className="max-h-[800px] overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2 text-left">Symbol</th>
                    <th className="px-2 py-2 text-left">Side</th>
                    <th className="px-2 py-2 text-left">Qty</th>
                    <th className="px-2 py-2 text-left">Net PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!loading && filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-5 text-center text-slate-500">
                        No trades yet.
                      </td>
                    </tr>
                  ) : null}

                  {filteredTrades.slice(0, 30).map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-50">
                      <td className="px-2 py-1.5 font-medium text-slate-900">
                        <Link href={`/trades/${trade.id}`} className="hover:underline">
                          {trade.symbol}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 text-slate-700">{trade.side}</td>
                      <td className="px-2 py-1.5 text-slate-700">{formatNumber(Number(trade.quantity ?? 0), 4)}</td>
                      <td className={`px-2 py-1.5 font-medium ${Number(trade.netPnl ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatNumber(Number(trade.netPnl ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Calendar Preview</h2>
              <Link href="/journal" className="text-xs font-medium text-sky-700 hover:text-sky-600">
                Full Journal
              </Link>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center text-sm font-semibold uppercase tracking-[0.06em] text-slate-500">
              {["L", "M", "M", "J", "V", "S", "D"].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-3">
              {miniCalendarDays.map((day) => {
                const key = toDateKey(day);
                const isCurrentMonth = day.getMonth() === firstDay.getMonth();
                const pnl = monthPnlByDay.get(key) ?? 0;
                const hasData = monthPnlByDay.has(key);

                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-4 text-center text-sm ${
                      isCurrentMonth
                        ? hasData
                          ? dayClass(pnl)
                          : "border-slate-200 bg-white text-slate-700"
                        : "border-slate-100 bg-slate-50 text-slate-300"
                    }`}
                    title={`${key} · ${formatNumber(pnl)}`}
                  >
                    <p className="font-semibold leading-none">{day.getDate()}</p>
                    {isCurrentMonth && hasData ? (
                      <p className="mt-2 text-xs leading-none opacity-90">{compactPnl(pnl)}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
