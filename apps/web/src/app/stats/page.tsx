"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { MetricLabel } from "@/components/metric-label";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";
import { formatNumber, pnlColorClass } from "@/lib/format";
import type {
  Account,
  BreakdownKey,
  DistributionMetric,
  StatsBreakdown,
  StatsDistribution,
  StatsSummary,
  StatsTimeAnalysis,
} from "@/types";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import { mockStatsSummary, mockStatsBreakdown, mockStatsDistribution, mockStatsTimeAnalysis } from "@/config/tutorial-mock-data";

// We will pass the translation function (t) into these or translate them inline.
const BREAKDOWN_KEYS = ["symbol", "setupName", "strategyTag", "assetClass", "side", "entryTimeframe", "planFollowed", "executionRating"] as const;
const DISTRIBUTION_KEYS = ["pnl", "rMultiple", "holdingTime"] as const;

export default function StatsPage() {
  return (
    <Suspense>
      <StatsPageContent />
    </Suspense>
  );
}

function StatsPageContent() {
  const selectedAccountId = useSelectedAccountId();
  const { t } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded } = useTutorialStatus();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [breakdown, setBreakdown] = useState<StatsBreakdown | null>(null);
  const [distribution, setDistribution] = useState<StatsDistribution | null>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<StatsTimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdownBy, setBreakdownBy] = useState<BreakdownKey>("symbol");
  const [distributionMetric, setDistributionMetric] = useState<DistributionMetric>("pnl");

  const baseQuery = useMemo(() => {
    if (!selectedAccountId) {
      return null;
    }

    return `accountId=${encodeURIComponent(selectedAccountId)}&period=ALL`;
  }, [selectedAccountId]);

  useEffect(() => {
    async function loadStats() {
      if (!baseQuery) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [accountsResponse, summaryResponse, breakdownResponse, distributionResponse, timeAnalysisResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch(`/api/stats/summary?${baseQuery}`),
          fetch(`/api/stats/breakdown?${baseQuery}&by=${breakdownBy}`),
          fetch(`/api/stats/distribution?${baseQuery}&metric=${distributionMetric}`),
          fetch(`/api/stats/time-analysis?${baseQuery}`),
        ]);

        const accountPayload = (await accountsResponse.json()) as { accounts?: Account[]; error?: string };
        const summaryPayload = (await summaryResponse.json()) as StatsSummary & { error?: string };
        const breakdownPayload = (await breakdownResponse.json()) as StatsBreakdown & { error?: string };
        const distributionPayload = (await distributionResponse.json()) as StatsDistribution & { error?: string };
        const timeAnalysisPayload = (await timeAnalysisResponse.json()) as StatsTimeAnalysis & { error?: string };

        if (!accountsResponse.ok) throw new Error(accountPayload.error ?? "Could not load accounts");
        if (!summaryResponse.ok) throw new Error(summaryPayload.error ?? "Could not load summary");
        if (!breakdownResponse.ok) throw new Error(breakdownPayload.error ?? "Could not load breakdown");
        if (!distributionResponse.ok) throw new Error(distributionPayload.error ?? "Could not load distribution");
        if (!timeAnalysisResponse.ok) throw new Error(timeAnalysisPayload.error ?? "Could not load time analysis");

        setAccounts(accountPayload.accounts ?? []);
        setSummary(summaryPayload);
        setBreakdown(breakdownPayload);
        setDistribution(distributionPayload);
        setTimeAnalysis(timeAnalysisPayload);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [baseQuery, breakdownBy, distributionMetric]);

  // Inject mock data when tutorial hasn't been completed and no real data
  const shouldUseMock = tutorialLoaded && tutorialsCompleted.stats !== true && !loading;
  const displaySummary = shouldUseMock ? mockStatsSummary : summary;
  const displayBreakdown = shouldUseMock ? mockStatsBreakdown : breakdown;
  const displayDistribution = shouldUseMock ? mockStatsDistribution : distribution;
  const displayTimeAnalysis = shouldUseMock ? mockStatsTimeAnalysis : timeAnalysis;

  const topBreakdown = displayBreakdown?.items.slice(0, 8) ?? [];
  const strongestWeekday = [...(displayTimeAnalysis?.weekday ?? [])].sort((a, b) => b.netPnl - a.netPnl)[0] ?? null;
  const strongestHour = [...(displayTimeAnalysis?.hourly ?? [])].sort((a, b) => b.netPnl - a.netPnl)[0] ?? null;
  const selectedAccountCurrency = accounts.find((account) => account.id === selectedAccountId)?.currency ?? "USD";
  const distributionBins = displayDistribution?.bins ?? [];
  const maxDistributionCount = Math.max(1, ...distributionBins.map((item) => item.count));
  const isMonetaryDistribution = distributionMetric === "pnl";
  const drawdownValue = displaySummary?.realized.maxDrawdown ?? 0;
  const drawdownDisplay = drawdownValue <= 0 ? `0 ${selectedAccountCurrency}` : `-${formatNumber(drawdownValue)} ${selectedAccountCurrency}`;

  function formatMoney(value: number) {
    return `${value > 0 ? "+" : ""}${formatNumber(value)} ${selectedAccountCurrency}`;
  }

  function distributionEmptyMessage() {
    if (distributionMetric === "rMultiple") {
      return t("stats.distribution.emptyRMultiple");
    }

    if (distributionMetric === "holdingTime") {
      return t("stats.distribution.emptyHolding");
    }

    return t("stats.distribution.emptyDefault");
  }

  return (
    <DashboardShell title={t("stats.title")}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        {tutorialLoaded && (
          <TutorialProvider
            page="stats"
            steps={tutorialStepsMap.stats}
            tutorialCompleted={tutorialsCompleted.stats === true}
          />
        )}
        {error ? (
          <section className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">
            {error}
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.25fr_1.25fr_1fr_1fr]" data-tutorial="stats-metrics">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label={t("stats.metrics.netPnl")} description={t("stats.metrics.netPnlDesc")} />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(displaySummary?.realized.netPnl ?? 0)}`}>
              {loading ? "..." : formatMoney(displaySummary?.realized.netPnl ?? 0)}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.netPnlNote")}</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.metrics.expectancy")}
                description={t("stats.metrics.expectancyDesc")}
              />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(displaySummary?.realized.expectancy ?? 0)}`}>
              {loading ? "..." : formatMoney(displaySummary?.realized.expectancy ?? 0)}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.expectancyNote")}</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.metrics.maxDrawdown")}
                description={t("stats.metrics.maxDrawdownDesc")}
              />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(-(displaySummary?.realized.maxDrawdown ?? 0))}`}>
              {loading ? "..." : drawdownDisplay}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.maxDrawdownNote")}</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label={t("stats.metrics.avgHolding")} description={t("stats.metrics.avgHoldingDesc")} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-primary font-mono">
              {loading ? "..." : `${formatNumber(displaySummary?.realized.averageHoldingHours ?? 0)}h`}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.avgHoldingNote")}</p>
          </article>
        </section>

        <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label={t("stats.metrics.bestWorst")} description={t("stats.metrics.bestWorstDesc")} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("stats.metrics.bestTrade")}</p>
                <p className={`mt-2 text-2xl font-semibold font-mono ${pnlColorClass(displaySummary?.realized.bestTrade ?? 0)}`}>
                  {loading ? "..." : formatMoney(displaySummary?.realized.bestTrade ?? 0)}
                </p>
                <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.bestTradeNote")}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("stats.metrics.worstTrade")}</p>
                <p className={`mt-2 text-2xl font-semibold font-mono ${pnlColorClass(displaySummary?.realized.worstTrade ?? 0)}`}>
                  {loading ? "..." : formatMoney(displaySummary?.realized.worstTrade ?? 0)}
                </p>
                <p className="mt-2 text-xs text-secondary font-sans">{t("stats.metrics.worstTradeNote")}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.metrics.streakSnapshot")}
                description={t("stats.metrics.streakSnapshotDesc")}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("stats.metrics.winStreak")}</p>
                <p className="mt-2 text-2xl font-semibold text-primary font-mono">{loading ? "..." : displaySummary?.realized.maxWinStreak ?? 0}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("stats.metrics.lossStreak")}</p>
                <p className="mt-2 text-2xl font-semibold text-primary font-mono">{loading ? "..." : displaySummary?.realized.maxLossStreak ?? 0}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-secondary font-sans">
              {loading ? "..." : `${t("stats.metrics.worstRun")} ${displaySummary?.realized.maxLossStreak ?? 0}`}
            </p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm" data-tutorial="stats-breakdown">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                  <MetricLabel
                    label={t("stats.breakdown.title")}
                    description={t("stats.breakdown.desc")}
                  />
                </div>
                <p className="mt-1 text-xs text-secondary font-sans">{t("stats.breakdown.subtitle")}</p>
              </div>
              <select
                value={breakdownBy}
                onChange={(event) => setBreakdownBy(event.target.value as BreakdownKey)}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-primary font-sans"
              >
                {BREAKDOWN_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`stats.breakdown.options.${key}` as Parameters<typeof t>[0])}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left uppercase tracking-[0.08em] text-secondary font-sans">
                  <tr>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.group")}</th>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.trades")}</th>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.winRate")}</th>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.net")}</th>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.pf")}</th>
                    <th className="px-2 py-2">{t("stats.breakdown.cols.avgR")}</th>
                  </tr>
                </thead>
                <tbody>
                  {topBreakdown.map((item) => (
                    <tr key={item.key} className="border-t border-border">
                      <td className="px-2 py-2 font-semibold text-primary font-sans">{item.label}</td>
                      <td className="px-2 py-2 text-secondary font-mono">{item.trades}</td>
                      <td className="px-2 py-2 text-secondary font-mono">{formatNumber(item.winRate, 1)}%</td>
                      <td className={`px-2 py-2 font-mono ${pnlColorClass(item.netPnl)}`}>{formatMoney(item.netPnl)}</td>
                      <td className="px-2 py-2 text-secondary font-mono">{Number.isFinite(item.profitFactor) ? formatNumber(item.profitFactor) : "∞"}</td>
                      <td className="px-2 py-2 text-secondary font-mono">{item.averageRMultiple == null ? "-" : formatNumber(item.averageRMultiple)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm" data-tutorial="stats-distribution">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                  <MetricLabel label={t("stats.distribution.title")} description={t("stats.distribution.desc")} />
                </div>
                <p className="mt-1 text-xs text-secondary font-sans">{t("stats.distribution.subtitle")}</p>
              </div>
              <select
                value={distributionMetric}
                onChange={(event) => setDistributionMetric(event.target.value as DistributionMetric)}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-primary font-sans"
              >
                {DISTRIBUTION_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`stats.distribution.options.${key}` as Parameters<typeof t>[0])}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex h-48 items-end gap-2 rounded-xl bg-surface-2 p-3">
              {distributionBins.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-secondary font-sans">
                  {distributionEmptyMessage()}
                </div>
              ) : distributionBins.map((bin) => {
                const height = `${Math.max(12, (bin.count / maxDistributionCount) * 100)}%`;
                return (
                  <div key={bin.label} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2 self-stretch">
                    <div className="absolute bottom-full mb-2 hidden rounded bg-slate-800 px-2 py-1 text-[10px] text-white group-hover:block">
                      {bin.label}: {bin.count}
                    </div>
                    <div className="w-full rounded-t-md bg-brand-500/80" style={{ height }} />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-secondary font-mono">
              <p>{t("stats.distribution.avg")}: {loading ? "..." : isMonetaryDistribution ? formatMoney(displayDistribution?.average ?? 0) : formatNumber(displayDistribution?.average ?? 0)}</p>
              <p>{t("stats.distribution.median")}: {loading ? "..." : isMonetaryDistribution ? formatMoney(displayDistribution?.median ?? 0) : formatNumber(displayDistribution?.median ?? 0)}</p>
              <p>{t("stats.distribution.min")}: {loading ? "..." : isMonetaryDistribution ? formatMoney(displayDistribution?.min ?? 0) : formatNumber(displayDistribution?.min ?? 0)}</p>
              <p>{t("stats.distribution.max")}: {loading ? "..." : isMonetaryDistribution ? formatMoney(displayDistribution?.max ?? 0) : formatNumber(displayDistribution?.max ?? 0)}</p>
              <p>{t("stats.distribution.samples")}: {loading ? "..." : displayDistribution?.sampleCount ?? 0}</p>
              <p>{t("stats.distribution.unit")}: {loading ? "..." : displayDistribution?.unit ?? "-"}</p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.timeAnalysis.weekdayEdge")}
                description={t("stats.timeAnalysis.weekdayEdgeDesc")}
              />
            </div>
            <div className="mt-4 space-y-2">
              {(timeAnalysis?.weekday ?? []).map((bucket) => (
                <div key={bucket.key}>
                  <div className="mb-1 flex items-center justify-between text-xs font-sans text-secondary">
                    <span>{bucket.label}</span>
                    <span className={pnlColorClass(bucket.netPnl)}>{formatMoney(bucket.netPnl)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${bucket.netPnl >= 0 ? "bg-pnl-positive" : "bg-pnl-negative"}`}
                      style={{ width: `${Math.min(100, Math.abs(bucket.netPnl) / Math.max(1, ...(timeAnalysis?.weekday ?? []).map((item) => Math.abs(item.netPnl))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.timeAnalysis.bestWindows")}
                description={t("stats.timeAnalysis.bestWindowsDesc")}
              />
            </div>
            <div className="mt-4 space-y-4 text-sm font-sans">
              <div>
                <p className="text-secondary">{t("stats.timeAnalysis.bestWeekday")}</p>
                <p className="mt-1 font-semibold text-primary">{strongestWeekday?.label ?? "-"}</p>
                <p className={`text-xs font-mono ${pnlColorClass(strongestWeekday?.netPnl ?? 0)}`}>{formatMoney(strongestWeekday?.netPnl ?? 0)}</p>
              </div>
              <div>
                <p className="text-secondary">{t("stats.timeAnalysis.bestHour")}</p>
                <p className="mt-1 font-semibold text-primary">{strongestHour?.label ?? "-"}</p>
                <p className={`text-xs font-mono ${pnlColorClass(strongestHour?.netPnl ?? 0)}`}>{formatMoney(strongestHour?.netPnl ?? 0)}</p>
              </div>
              <div>
                <div className="text-secondary">
                  <MetricLabel
                    label={t("stats.timeAnalysis.streaks")}
                    description={t("stats.timeAnalysis.streaksDesc")}
                  />
                </div>
                <p className="mt-1 font-semibold text-primary font-mono">
                  {loading ? "..." : `${displaySummary?.realized.maxWinStreak ?? 0}W / ${displaySummary?.realized.maxLossStreak ?? 0}L`}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              <MetricLabel
                label={t("stats.timeAnalysis.seasonality")}
                description={t("stats.timeAnalysis.seasonalityDesc")}
              />
            </div>
            <div className="mt-4 space-y-2">
              {(timeAnalysis?.monthly ?? []).slice(-6).map((bucket) => (
                <div key={bucket.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-xs">
                  <span className="font-sans text-secondary">{bucket.label}</span>
                  <span className={`font-mono ${pnlColorClass(bucket.netPnl)}`}>{formatMoney(bucket.netPnl)}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
