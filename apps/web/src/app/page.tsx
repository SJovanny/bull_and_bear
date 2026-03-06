"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { toDateKey } from "@/lib/format";
import type { Account, Trade, DashboardPeriod } from "@/types";

function monthBounds(anchor: Date) {
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  return { firstDay, gridStart };
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

  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Interface pro de performance trading"
    >
      <div className="flex flex-col gap-4 max-w-[1440px] mx-auto">
        <section className="rounded-xl border border-border bg-surface-1 p-2 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            {(["7D", "30D", "YTD", "ALL"] as DashboardPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-semibold tracking-[0.08em] transition font-sans ${
                  period === item
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-surface-1 text-secondary hover:bg-surface-2 hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-sans shadow-sm">
            {error}. Verify you are authenticated with Supabase, then refresh.
          </section>
        ) : null}

        <KpiCards
          loading={loading}
          totalNetPnl={totalNetPnl}
          winRate={winRate}
          profitFactor={profitFactor}
          totalTrades={totalTrades}
          openTrades={openTrades}
          closedTrades={closedTrades}
        />

        <DashboardCharts
          totalTrades={totalTrades}
          period={period}
          totalNetPnl={totalNetPnl}
          equityCurve={equityCurve}
          last14Days={last14Days}
          openTrades={openTrades}
          closedTrades={closedTrades}
          accountsCount={accounts.length}
        />

        <section className="grid gap-3 xl:grid-cols-[0.55fr_1.45fr] items-start">
          <RecentTrades loading={loading} trades={filteredTrades} />
          <MiniCalendar 
            miniCalendarDays={miniCalendarDays} 
            monthPnlByDay={monthPnlByDay} 
            firstDay={firstDay} 
          />
        </section>
      </div>
    </DashboardShell>
  );
}