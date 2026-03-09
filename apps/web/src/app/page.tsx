"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import type { Account, DashboardPeriod, StatsCalendar, StatsEquity, StatsSummary, Trade } from "@/types";

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [equity, setEquity] = useState<StatsEquity | null>(null);
  const [calendar, setCalendar] = useState<StatsCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("30D");
  const selectedAccountId = useSelectedAccountId();

  const accountScopedBase = useMemo(() => {
    if (!selectedAccountId) {
      return null;
    }

    return `accountId=${encodeURIComponent(selectedAccountId)}&period=${encodeURIComponent(period)}`;
  }, [period, selectedAccountId]);

  useEffect(() => {
    async function loadData() {
      if (!selectedAccountId || !accountScopedBase) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
        const [accountsResponse, tradesResponse, summaryResponse, equityResponse, calendarResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch(`/api/trades?accountId=${encodeURIComponent(selectedAccountId)}`),
          fetch(`/api/stats/summary?${accountScopedBase}`),
          fetch(`/api/stats/equity?${accountScopedBase}&groupBy=day`),
          fetch(`/api/stats/calendar?accountId=${encodeURIComponent(selectedAccountId)}&month=${month}`),
        ]);

        const accountPayload = (await accountsResponse.json()) as { accounts?: Account[]; error?: string };
        const tradePayload = (await tradesResponse.json()) as { trades?: Trade[]; error?: string };
        const summaryPayload = (await summaryResponse.json()) as StatsSummary & { error?: string };
        const equityPayload = (await equityResponse.json()) as StatsEquity & { error?: string };
        const calendarPayload = (await calendarResponse.json()) as StatsCalendar & { error?: string };

        if (!accountsResponse.ok) {
          throw new Error(accountPayload.error ?? "Could not load accounts");
        }

        if (!tradesResponse.ok) {
          throw new Error(tradePayload.error ?? "Could not load trades");
        }

        if (!summaryResponse.ok) {
          throw new Error(summaryPayload.error ?? "Could not load summary");
        }

        if (!equityResponse.ok) {
          throw new Error(equityPayload.error ?? "Could not load equity");
        }

        if (!calendarResponse.ok) {
          throw new Error(calendarPayload.error ?? "Could not load calendar");
        }

        setAccounts(accountPayload.accounts ?? []);
        setTrades(tradePayload.trades ?? []);
        setSummary(summaryPayload);
        setEquity(equityPayload);
        setCalendar(calendarPayload);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accountScopedBase, period, selectedAccountId]);

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
          totalNetPnl={summary?.realized.netPnl ?? 0}
          winRate={summary?.realized.winRate ?? 0}
          profitFactor={summary?.realized.profitFactor ?? 0}
          totalTrades={summary?.activity.totalTrades ?? 0}
          openTrades={summary?.activity.openTrades ?? 0}
          closedTrades={summary?.activity.closedTrades ?? 0}
        />

        <DashboardCharts
          totalTrades={summary?.activity.totalTrades ?? 0}
          period={period}
          totalNetPnl={equity?.totalNetPnl ?? 0}
          cumulativeSeries={equity?.cumulativeSeries ?? []}
          last14Days={equity?.recentDailySeries ?? []}
          openTrades={summary?.activity.openTrades ?? 0}
          closedTrades={summary?.activity.closedTrades ?? 0}
          accountsCount={accounts.length}
        />

        <section className="grid gap-3 xl:grid-cols-[0.55fr_1.45fr] items-start">
          <RecentTrades loading={loading} trades={trades} />
          <MiniCalendar days={calendar?.days ?? []} />
        </section>
      </div>
    </DashboardShell>
  );
}
