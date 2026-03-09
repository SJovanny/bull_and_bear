import type { StatsSummary } from "@/types";

import { formatRange, toNumber, tradePnl } from "./serializers";
import type { StatsQuery, StatsTrade } from "./types";

function computeLongestStreak(values: number[], predicate: (value: number) => boolean) {
  let best = 0;
  let current = 0;

  for (const value of values) {
    if (predicate(value)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

export function buildSummary(filters: StatsQuery, activityTrades: StatsTrade[], closedTrades: StatsTrade[]): StatsSummary {
  const pnlValues = closedTrades.map(tradePnl);
  const winners = pnlValues.filter((value) => value > 0);
  const losers = pnlValues.filter((value) => value < 0);
  const breakeven = pnlValues.filter((value) => value === 0);
  const grossProfit = winners.reduce((sum, value) => sum + value, 0);
  const grossLossAbs = Math.abs(losers.reduce((sum, value) => sum + value, 0));
  const netPnl = pnlValues.reduce((sum, value) => sum + value, 0);
  const avgPnl = closedTrades.length > 0 ? netPnl / closedTrades.length : 0;
  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? losers.reduce((sum, value) => sum + value, 0) / losers.length : 0;
  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;
  const profitFactor = grossLossAbs === 0 ? (grossProfit > 0 ? Number.POSITIVE_INFINITY : 0) : grossProfit / grossLossAbs;
  const expectancy = avgPnl;

  const holdingHours = closedTrades
    .filter((trade) => trade.closedAt)
    .map((trade) => (new Date(trade.closedAt as Date).getTime() - new Date(trade.openedAt).getTime()) / 3600000)
    .filter((value) => Number.isFinite(value) && value >= 0);

  const averageHoldingHours =
    holdingHours.length > 0 ? holdingHours.reduce((sum, value) => sum + value, 0) / holdingHours.length : 0;

  return {
    period: filters.period,
    range: formatRange(filters),
    activity: {
      totalTrades: activityTrades.length,
      openTrades: activityTrades.filter((trade) => trade.status === "OPEN").length,
      closedTrades: activityTrades.filter((trade) => trade.status === "CLOSED").length,
      canceledTrades: activityTrades.filter((trade) => trade.status === "CANCELED").length,
    },
    realized: {
      closedTrades: closedTrades.length,
      winners: winners.length,
      losers: losers.length,
      breakeven: breakeven.length,
      netPnl,
      grossProfit,
      grossLossAbs,
      avgPnl,
      avgWin,
      avgLoss,
      winRate,
      profitFactor,
      expectancy,
      averageHoldingHours,
      maxWinStreak: computeLongestStreak(pnlValues, (value) => value > 0),
      maxLossStreak: computeLongestStreak(pnlValues, (value) => value < 0),
      bestTrade: closedTrades.length > 0 ? Math.max(...pnlValues) : 0,
      worstTrade: closedTrades.length > 0 ? Math.min(...pnlValues) : 0,
    },
  };
}
