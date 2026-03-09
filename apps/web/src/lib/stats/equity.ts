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

export function buildEquity(filters: ResolvedStatsFilters, closedTrades: StatsTrade[]): StatsEquity {
  const grouped = new Map<string, { key: string; label: string; pnl: number; tradeCount: number; date: Date }>();
  const groupBy = filters.groupBy ?? "day";

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
        tradeCount: entry.tradeCount,
      };
    });

  return {
    period: filters.period,
    range: formatRange(filters),
    groupBy,
    totalNetPnl: cumulativePnl,
    realizedTrades: closedTrades.length,
    cumulativeSeries,
    recentDailySeries: cumulativeSeries.slice(-14),
  };
}
