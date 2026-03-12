import type { StatsEquity } from "@/types";

import {
  formatDayLabel,
  formatMonthKey,
  formatMonthLabel,
  formatRange,
  formatWeekLabel,
  getIsoWeek,
  toDateKey,
  tradePnl,
} from "./serializers";
import type { ResolvedStatsFilters, StatsTrade } from "./types";

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildRecentDailySeries(
  grouped: Map<string, { key: string; label: string; pnl: number; tradeCount: number; date: Date }>,
  anchorDate: Date,
  initialBalance: number | null,
) {
  const end = startOfUtcDay(anchorDate);
  const start = addUtcDays(end, -13);
  let cumulativePnl = 0;
  const hasBalance = initialBalance !== null && initialBalance > 0;

  return Array.from({ length: 14 }, (_, index) => {
    const date = addUtcDays(start, index);
    const key = toDateKey(date);
    const entry = grouped.get(key);
    const pnl = entry?.pnl ?? 0;

    cumulativePnl += pnl;

    return {
      key,
      label: formatDayLabel(date),
      pnl,
      cumulativePnl,
      cumulativePercent: hasBalance ? (cumulativePnl / initialBalance) * 100 : null,
      tradeCount: entry?.tradeCount ?? 0,
    };
  });
}

function bucketKey(date: Date, groupBy: "day" | "week" | "month") {
  if (groupBy === "month") {
    return formatMonthKey(date);
  }

  if (groupBy === "week") {
    return `${date.getUTCFullYear()}-W${String(getIsoWeek(date)).padStart(2, "0")}`;
  }

  return toDateKey(date);
}

function bucketLabel(date: Date, groupBy: "day" | "week" | "month") {
  if (groupBy === "month") {
    return formatMonthLabel(date);
  }

  if (groupBy === "week") {
    return formatWeekLabel(date);
  }

  return formatDayLabel(date);
}

export function buildEquity(filters: ResolvedStatsFilters, closedTrades: StatsTrade[], initialBalance: number | null = null): StatsEquity {
  const grouped = new Map<string, { key: string; label: string; pnl: number; tradeCount: number; date: Date }>();
  const groupBy = filters.groupBy ?? "day";
  const hasBalance = initialBalance !== null && initialBalance > 0;

  for (const trade of closedTrades) {
    const closeDate = trade.closedAt ? new Date(trade.closedAt) : new Date(trade.openedAt);
    const key = bucketKey(closeDate, groupBy);
    const current = grouped.get(key) ?? {
      key,
      label: bucketLabel(closeDate, groupBy),
      pnl: 0,
      tradeCount: 0,
      date: closeDate,
    };

    current.pnl += tradePnl(trade);
    current.tradeCount += 1;
    grouped.set(key, current);
  }

  let cumulativePnl = 0;
  const cumulativeSeries = [...grouped.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((entry) => {
      cumulativePnl += entry.pnl;
      return {
        key: entry.key,
        label: entry.label,
        pnl: entry.pnl,
        cumulativePnl,
        cumulativePercent: hasBalance ? (cumulativePnl / initialBalance) * 100 : null,
        tradeCount: entry.tradeCount,
      };
    });
  const recentDailySeries = buildRecentDailySeries(grouped, filters.to ?? new Date(), initialBalance);

  return {
    period: filters.period,
    range: formatRange(filters),
    groupBy,
    totalNetPnl: cumulativePnl,
    realizedTrades: closedTrades.length,
    initialBalance,
    cumulativeSeries,
    recentDailySeries,
  };
}
