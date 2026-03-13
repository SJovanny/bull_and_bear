"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { MetricLabel } from "@/components/metric-label";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
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

const BREAKDOWN_OPTIONS: { value: BreakdownKey; label: string }[] = [
  { value: "symbol", label: "Symbol" },
  { value: "setupName", label: "Setup" },
  { value: "strategyTag", label: "Strategy" },
  { value: "assetClass", label: "Asset class" },
  { value: "side", label: "Direction" },
  { value: "entryTimeframe", label: "Entry TF" },
  { value: "planFollowed", label: "Plan followed" },
  { value: "executionRating", label: "Execution" },
];

const DISTRIBUTION_OPTIONS: { value: DistributionMetric; label: string }[] = [
  { value: "pnl", label: "PnL" },
  { value: "rMultiple", label: "R multiple" },
  { value: "holdingTime", label: "Holding time" },
];

export default function StatsPage() {
  return (
    <Suspense>
      <StatsPageContent />
    </Suspense>
  );
}

function StatsPageContent() {
  const selectedAccountId = useSelectedAccountId();
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

  const topBreakdown = breakdown?.items.slice(0, 8) ?? [];
  const strongestWeekday = [...(timeAnalysis?.weekday ?? [])].sort((a, b) => b.netPnl - a.netPnl)[0] ?? null;
  const strongestHour = [...(timeAnalysis?.hourly ?? [])].sort((a, b) => b.netPnl - a.netPnl)[0] ?? null;
  const selectedAccountCurrency = accounts.find((account) => account.id === selectedAccountId)?.currency ?? "USD";
  const distributionBins = distribution?.bins ?? [];
  const maxDistributionCount = Math.max(1, ...distributionBins.map((item) => item.count));
  const isMonetaryDistribution = distributionMetric === "pnl";
  const drawdownValue = summary?.realized.maxDrawdown ?? 0;
  const drawdownDisplay = drawdownValue <= 0 ? `0 ${selectedAccountCurrency}` : `-${formatNumber(drawdownValue)} ${selectedAccountCurrency}`;

  function formatMoney(value: number) {
    return `${value > 0 ? "+" : ""}${formatNumber(value)} ${selectedAccountCurrency}`;
  }

  function distributionEmptyMessage() {
    if (distributionMetric === "rMultiple") {
      return "No trades with risk amount available for this account yet.";
    }

    if (distributionMetric === "holdingTime") {
      return "No closed trades with valid open and close timestamps for this range.";
    }

    return "No closed trades available in this range yet.";
  }

  return (
    <DashboardShell title="Statistiques">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        {error ? (
          <section className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">
            {error}
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.25fr_1.25fr_1fr_1fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label="Net PnL" description="Total net profit or loss on closed trades for the selected period." />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(summary?.realized.netPnl ?? 0)}`}>
              {loading ? "..." : formatMoney(summary?.realized.netPnl ?? 0)}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">Closed-trade performance in your account currency.</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label="Expectancy"
                description="Average amount won or lost per closed trade. Positive means the strategy is profitable on average."
              />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(summary?.realized.expectancy ?? 0)}`}>
              {loading ? "..." : formatMoney(summary?.realized.expectancy ?? 0)}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">Average expected result per closed trade.</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label="Max Drawdown"
                description="Largest drop from your equity peak to a following low. It measures how much pain your account can go through."
              />
            </div>
            <p className={`mt-2 text-3xl font-semibold font-mono ${pnlColorClass(-(summary?.realized.maxDrawdown ?? 0))}`}>
              {loading ? "..." : drawdownDisplay}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">Largest peak-to-trough drop on realized equity.</p>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label="Avg holding" description="Average time a closed trade stays open." />
            </div>
            <p className="mt-2 text-3xl font-semibold text-primary font-mono">
              {loading ? "..." : `${formatNumber(summary?.realized.averageHoldingHours ?? 0)}h`}
            </p>
            <p className="mt-2 text-xs text-secondary font-sans">Average duration between entry and exit.</p>
          </article>
        </section>

        <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel label="Best / Worst" description="Best and worst single closed trade in the selected range." />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Best Trade</p>
                <p className={`mt-2 text-2xl font-semibold font-mono ${pnlColorClass(summary?.realized.bestTrade ?? 0)}`}>
                  {loading ? "..." : formatMoney(summary?.realized.bestTrade ?? 0)}
                </p>
                <p className="mt-2 text-xs text-secondary font-sans">Single strongest closed trade in the selected range.</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Worst Trade</p>
                <p className={`mt-2 text-2xl font-semibold font-mono ${pnlColorClass(summary?.realized.worstTrade ?? 0)}`}>
                  {loading ? "..." : formatMoney(summary?.realized.worstTrade ?? 0)}
                </p>
                <p className="mt-2 text-xs text-secondary font-sans">Single weakest closed trade, useful but not equal to drawdown.</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.1em] text-secondary font-sans">
              <MetricLabel
                label="Streak Snapshot"
                description="Longest sequences of wins and losses. Losing streaks help you calibrate safer position sizing."
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Win Streak</p>
                <p className="mt-2 text-2xl font-semibold text-primary font-mono">{loading ? "..." : summary?.realized.maxWinStreak ?? 0}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Loss Streak</p>
                <p className="mt-2 text-2xl font-semibold text-primary font-mono">{loading ? "..." : summary?.realized.maxLossStreak ?? 0}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-secondary font-sans">
              Worst run: {loading ? "..." : `${summary?.realized.maxLossStreak ?? 0} losing trades in a row`}
            </p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                  <MetricLabel
                    label="Breakdown"
                    description="Grouped performance stats by symbol, setup, strategy, direction, or execution attributes."
                  />
                </div>
                <p className="mt-1 text-xs text-secondary font-sans">Server-side grouped performance analytics</p>
              </div>
              <select
                value={breakdownBy}
                onChange={(event) => setBreakdownBy(event.target.value as BreakdownKey)}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-primary font-sans"
              >
                {BREAKDOWN_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left uppercase tracking-[0.08em] text-secondary font-sans">
                  <tr>
                    <th className="px-2 py-2">Group</th>
                    <th className="px-2 py-2">Trades</th>
                    <th className="px-2 py-2">Win Rate</th>
                    <th className="px-2 py-2">Net</th>
                    <th className="px-2 py-2">PF</th>
                    <th className="px-2 py-2">Avg R</th>
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

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                  <MetricLabel label="Distribution" description="Shows how your results are spread across ranges, not just the average." />
                </div>
                <p className="mt-1 text-xs text-secondary font-sans">Histogram built from backend bins</p>
              </div>
              <select
                value={distributionMetric}
                onChange={(event) => setDistributionMetric(event.target.value as DistributionMetric)}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-primary font-sans"
              >
                {DISTRIBUTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
              <p>Avg: {loading ? "..." : isMonetaryDistribution ? formatMoney(distribution?.average ?? 0) : formatNumber(distribution?.average ?? 0)}</p>
              <p>Median: {loading ? "..." : isMonetaryDistribution ? formatMoney(distribution?.median ?? 0) : formatNumber(distribution?.median ?? 0)}</p>
              <p>Min: {loading ? "..." : isMonetaryDistribution ? formatMoney(distribution?.min ?? 0) : formatNumber(distribution?.min ?? 0)}</p>
              <p>Max: {loading ? "..." : isMonetaryDistribution ? formatMoney(distribution?.max ?? 0) : formatNumber(distribution?.max ?? 0)}</p>
              <p>Samples: {loading ? "..." : distribution?.sampleCount ?? 0}</p>
              <p>Unit: {loading ? "..." : distribution?.unit ?? "-"}</p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              <MetricLabel
                label="Weekday Edge"
                description="Performance grouped by day of week to reveal stronger or weaker sessions."
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
                label="Best Windows"
                description="Your strongest weekday and trading hour based on closed-trade performance."
              />
            </div>
            <div className="mt-4 space-y-4 text-sm font-sans">
              <div>
                <p className="text-secondary">Best weekday</p>
                <p className="mt-1 font-semibold text-primary">{strongestWeekday?.label ?? "-"}</p>
                <p className={`text-xs font-mono ${pnlColorClass(strongestWeekday?.netPnl ?? 0)}`}>{formatMoney(strongestWeekday?.netPnl ?? 0)}</p>
              </div>
              <div>
                <p className="text-secondary">Best hour</p>
                <p className="mt-1 font-semibold text-primary">{strongestHour?.label ?? "-"}</p>
                <p className={`text-xs font-mono ${pnlColorClass(strongestHour?.netPnl ?? 0)}`}>{formatMoney(strongestHour?.netPnl ?? 0)}</p>
              </div>
              <div>
                <div className="text-secondary">
                  <MetricLabel
                    label="Streaks"
                    description="Longest sequence of consecutive winning and losing trades. Use losing streaks to size positions more safely."
                  />
                </div>
                <p className="mt-1 font-semibold text-primary font-mono">
                  {loading ? "..." : `${summary?.realized.maxWinStreak ?? 0}W / ${summary?.realized.maxLossStreak ?? 0}L`}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              <MetricLabel
                label="Monthly Seasonality"
                description="Performance grouped by month to spot recurring strength or weakness over time."
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
