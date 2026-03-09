import type { StatsTimeAnalysis, TimeBucket } from "@/types";

import { formatRange, tradePnl } from "./serializers";
import type { StatsQuery, StatsTrade } from "./types";

function buildBuckets(labels: string[]) {
  return labels.map((label, index) => ({
    key: String(index),
    label,
    trades: 0,
    winners: 0,
    losers: 0,
    winRate: 0,
    netPnl: 0,
    avgPnl: 0,
  } satisfies TimeBucket));
}

export function buildTimeAnalysis(filters: StatsQuery, closedTrades: StatsTrade[]): StatsTimeAnalysis {
  const weekday = buildBuckets(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const hourly = buildBuckets(Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`));
  const monthlyMap = new Map<string, TimeBucket>();

  for (const trade of closedTrades) {
    const closeDate = trade.closedAt ? new Date(trade.closedAt) : new Date(trade.openedAt);
    const pnl = tradePnl(trade);
    const weekdayIndex = (closeDate.getUTCDay() + 6) % 7;
    const hourIndex = closeDate.getUTCHours();
    const monthKey = `${closeDate.getUTCFullYear()}-${String(closeDate.getUTCMonth() + 1).padStart(2, "0")}`;
    const monthLabel = closeDate.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

    const weekdayBucket = weekday[weekdayIndex];
    const hourlyBucket = hourly[hourIndex];
    const monthlyBucket =
      monthlyMap.get(monthKey) ??
      {
        key: monthKey,
        label: monthLabel,
        trades: 0,
        winners: 0,
        losers: 0,
        winRate: 0,
        netPnl: 0,
        avgPnl: 0,
      };

    for (const bucket of [weekdayBucket, hourlyBucket, monthlyBucket]) {
      bucket.trades += 1;
      bucket.netPnl += pnl;
      if (pnl > 0) bucket.winners += 1;
      if (pnl < 0) bucket.losers += 1;
    }

    monthlyMap.set(monthKey, monthlyBucket);
  }

  const finalize = (bucket: TimeBucket) => ({
    ...bucket,
    winRate: bucket.trades > 0 ? (bucket.winners / bucket.trades) * 100 : 0,
    avgPnl: bucket.trades > 0 ? bucket.netPnl / bucket.trades : 0,
  });

  return {
    period: filters.period,
    range: formatRange(filters),
    weekday: weekday.map(finalize),
    hourly: hourly.map(finalize),
    monthly: [...monthlyMap.values()].sort((a, b) => a.key.localeCompare(b.key)).map(finalize),
  };
}
