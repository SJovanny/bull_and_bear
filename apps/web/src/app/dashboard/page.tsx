"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { DashboardNotesPopover } from "@/components/dashboard/notes-modal";
import LoadingSpinner from "@/components/loading-spinner";
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
  const [notesHover, setNotesHover] = useState(false);
  const [notesLocked, setNotesLocked] = useState(false);
  const notesOpen = notesHover || notesLocked;
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notesLocked) return;
    function handleClick(e: MouseEvent) {
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) {
        setNotesLocked(false);
        setNotesHover(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notesLocked]);
  const selectedAccountId = useSelectedAccountId();
  const { t } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded, markCompleted } = useTutorialStatus();
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
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

        // Accounts, trades, and calendar don't depend on period — only
        // refetch them when the selected account changes (not on period toggle).
        const accountPromise = accounts.length > 0
          ? Promise.resolve(null)
          : fetch("/api/accounts").then(async (r) => {
              const p = (await r.json()) as { accounts?: Account[]; error?: string };
              if (r.status === 401) { router.replace("/?authError=unauthorized&next=/dashboard"); return null; }
              if (!r.ok) throw new Error(p.error ?? "Could not load accounts");
              return p.accounts ?? [];
            });

        const [newAccounts, tradesResponse, summaryResponse, equityResponse, calendarResponse] = await Promise.all([
          accountPromise,
          fetch(`/api/trades?accountId=${encodeURIComponent(selectedAccountId)}`),
          fetch(`/api/stats/summary?${accountScopedBase}`),
          fetch(`/api/stats/equity?${accountScopedBase}&groupBy=day`),
          fetch(`/api/stats/calendar?accountId=${encodeURIComponent(selectedAccountId)}&month=${month}`),
        ]);

        if (
          tradesResponse.status === 401 ||
          summaryResponse.status === 401 ||
          equityResponse.status === 401 ||
          calendarResponse.status === 401
        ) {
          router.replace("/?authError=unauthorized&next=/dashboard");
          return;
        }

        const tradePayload = (await tradesResponse.json()) as { trades?: Trade[]; error?: string };
        const summaryPayload = (await summaryResponse.json()) as StatsSummary & { error?: string };
        const equityPayload = (await equityResponse.json()) as StatsEquity & { error?: string };
        const calendarPayload = (await calendarResponse.json()) as StatsCalendar & { error?: string };

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

        if (newAccounts) {
          setAccounts(newAccounts);
        }
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
            onCompleted={() => markCompleted("dashboard")}
          />
        )}

        <section className="rounded-xl border border-border bg-surface-1 p-2 shadow-sm transition-shadow hover:shadow-md" data-tutorial="period-selector">
          <div className="flex flex-wrap items-center gap-2">
            {(["7D", "30D", "YTD", "ALL"] as DashboardPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                title={t(`dashboard.period.${item}.tooltip`)}
                onClick={() => setPeriod(item)}
                className={`inline-flex h-9 items-center justify-center rounded-md px-3 font-sans text-xs font-semibold tracking-[0.08em] transition ${
                  period === item
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-surface-1 text-secondary hover:bg-surface-2 hover:text-primary"
                }`}
              >
                {t(`dashboard.period.${item}`)}
              </button>
            ))}

            <div className="flex-1" />

            <div
              ref={notesRef}
              className="relative"
              onMouseEnter={() => setNotesHover(true)}
              onMouseLeave={() => { if (!notesLocked) setNotesHover(false); }}
            >
              <button
                type="button"
                onClick={() => setNotesLocked((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-secondary transition hover:bg-surface-2 hover:text-primary"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                {t("dashboard.notesModal.title")}
              </button>
              <DashboardNotesPopover open={notesOpen} />
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-sans text-sm text-rose-700 shadow-sm">
            {error === "Unauthorized" ? "You must be connected to access this page." : error}
          </section>
        ) : null}

        {loading && !shouldUseMock ? (
          <LoadingSpinner />
        ) : (
          <>
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
          </>
        )}
      </div>
    </DashboardShell>
  );
}
