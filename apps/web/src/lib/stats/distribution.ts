import type { StatsDistribution } from "@/types";

import { formatRange, tradePnl, tradeRisk } from "./serializers";
import type { ResolvedStatsFilters, StatsTrade } from "./types";

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function buildBins(values: number[]) {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(values.length))));
  const spread = max - min || 1;
  const width = spread / binCount;

  return Array.from({ length: binCount }, (_, index) => {
    const start = min + index * width;
    const end = index === binCount - 1 ? max : start + width;
    const count = values.filter((value) => {
      if (index === binCount - 1) {
        return value >= start && value <= end;
      }

      return value >= start && value < end;
    }).length;

    return {
      start,
      end,
      label: `${start.toFixed(2)} to ${end.toFixed(2)}`,
      count,
    };
  });
}

function valuesForMetric(metric: NonNullable<ResolvedStatsFilters["distributionMetric"]>, trades: StatsTrade[]) {
  if (metric === "holdingTime") {
    return trades
      .filter((trade) => trade.closedAt)
      .map((trade) => (new Date(trade.closedAt as Date).getTime() - new Date(trade.openedAt).getTime()) / 3600000)
      .filter((value) => Number.isFinite(value) && value >= 0);
  }

  if (metric === "rMultiple") {
    return trades
      .map((trade) => {
        const risk = tradeRisk(trade);
        return risk ? tradePnl(trade) / risk : null;
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }

  return trades.map(tradePnl);
}

export function buildDistribution(filters: ResolvedStatsFilters, closedTrades: StatsTrade[]): StatsDistribution {
  const metric = filters.distributionMetric ?? "pnl";
  const values = valuesForMetric(metric, closedTrades);
  const average = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    period: filters.period,
    range: formatRange(filters),
    metric,
    unit: metric === "holdingTime" ? "hours" : metric === "rMultiple" ? "R" : "currency",
    sampleCount: values.length,
    average,
    median: median(values),
    min: values.length > 0 ? Math.min(...values) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    bins: buildBins(values),
  };
}
