"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { useTranslation } from "@/lib/i18n/context";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import { mockTrades, mockStatsSummary, mockStatsEquity, mockStatsCalendar } from "@/config/tutorial-mock-data";
import type { Account, DashboardPeriod, StatsCalendar, StatsEquity, StatsSummary, Trade } from "@/types";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [equity, setEquity] = useState<StatsEquity | null>(null);
  const [calendar, setCalendar] = useState<StatsCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("30D");
  const selectedAccountId = useSelectedAccountId();
  const { t } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded } = useTutorialStatus();
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );
  const selectedAccountCurrency = selectedAccount?.currency ?? "USD";

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

        if (
          accountsResponse.status === 401 ||
          tradesResponse.status === 401 ||
          summaryResponse.status === 401 ||
          equityResponse.status === 401 ||
          calendarResponse.status === 401
        ) {
          router.replace("/?authError=unauthorized&next=/dashboard");
          return;
        }

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
  }, [accountScopedBase, period, router, selectedAccountId]);

  // Inject mock data when tutorial hasn't been completed and no real data
  const shouldUseMock = tutorialLoaded && tutorialsCompleted.dashboard !== true && !loading;
  const displayTrades = shouldUseMock ? (mockTrades as Trade[]) : trades;
  const displaySummary = shouldUseMock ? mockStatsSummary : summary;
  const displayEquity = shouldUseMock ? mockStatsEquity : equity;
  const displayCalendar = shouldUseMock ? mockStatsCalendar : calendar;

  return (
    <DashboardShell title={t("dashboard.title")} >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        {tutorialLoaded && (
          <TutorialProvider
            page="dashboard"
            steps={tutorialStepsMap.dashboard}
            tutorialCompleted={tutorialsCompleted.dashboard === true}
          />
        )}

        <section className="rounded-xl border border-border bg-surface-1 p-2 shadow-sm transition-shadow hover:shadow-md" data-tutorial="period-selector">
          <div className="flex flex-wrap items-center gap-2">
            {(["7D", "30D", "YTD", "ALL"] as DashboardPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`inline-flex h-9 items-center justify-center rounded-md px-3 font-sans text-xs font-semibold tracking-[0.08em] transition ${
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
          <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-sans text-sm text-rose-700 shadow-sm">
            {error === "Unauthorized" ? "You must be connected to access this page." : error}
          </section>
        ) : null}

        <div data-tutorial="kpi-cards">
          <KpiCards
            loading={loading && !shouldUseMock}
            totalNetPnl={displaySummary?.realized.netPnl ?? 0}
            winRate={displaySummary?.realized.winRate ?? 0}
            profitFactor={displaySummary?.realized.profitFactor ?? 0}
            totalTrades={displaySummary?.activity.totalTrades ?? 0}
            openTrades={displaySummary?.activity.openTrades ?? 0}
            closedTrades={displaySummary?.activity.closedTrades ?? 0}
            currency={selectedAccountCurrency}
            currentBalance={displaySummary?.currentBalance ?? null}
            returnPercent={displaySummary?.returnPercent ?? null}
            maxDrawdownPercent={displaySummary?.maxDrawdownPercent ?? null}
          />
        </div>

        <div data-tutorial="charts">
          <DashboardCharts
            totalTrades={displaySummary?.activity.totalTrades ?? 0}
            period={period}
            totalNetPnl={displayEquity?.totalNetPnl ?? 0}
            cumulativeSeries={displayEquity?.cumulativeSeries ?? []}
            last14Days={displayEquity?.recentDailySeries ?? []}
            openTrades={displaySummary?.activity.openTrades ?? 0}
            closedTrades={displaySummary?.activity.closedTrades ?? 0}
            accountsCount={accounts.length}
            initialBalance={displayEquity?.initialBalance ?? null}
          />
        </div>

        <section className="grid items-start gap-3 xl:grid-cols-[0.55fr_1.45fr]">
          <div data-tutorial="recent-trades">
            <RecentTrades loading={loading && !shouldUseMock} trades={displayTrades} />
          </div>
          <div data-tutorial="mini-calendar">
            <MiniCalendar days={displayCalendar?.days ?? []} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
