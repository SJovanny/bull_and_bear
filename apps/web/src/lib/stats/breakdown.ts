import type { StatsBreakdown, StatsBreakdownItem } from "@/types";

import { formatRange, normalizeLabel, tradePnl, tradeRisk } from "./serializers";
import type { ResolvedStatsFilters, StatsTrade } from "./types";

function groupValue(trade: StatsTrade, key: NonNullable<ResolvedStatsFilters["breakdownBy"]>) {
  switch (key) {
    case "symbol":
      return trade.symbol;
    case "setupName":
      return trade.setupName;
    case "strategyTag":
      return trade.strategyTag;
    case "assetClass":
      return trade.assetClass;
    case "side":
      return trade.side;
    case "entryTimeframe":
      return trade.entryTimeframe;
    case "higherTimeframeBias":
      return trade.higherTimeframeBias;
    case "planFollowed":
      return trade.planFollowed;
    case "emotionalState":
      return trade.emotionalState;
    case "executionRating":
      return trade.executionRating;
  }
}

export function buildBreakdown(filters: ResolvedStatsFilters, closedTrades: StatsTrade[]): StatsBreakdown {
  const by = filters.breakdownBy ?? "symbol";
  const groups = new Map<string, StatsBreakdownItem & { grossProfit: number; grossLossAbs: number; rTotal: number; rCount: number }>();

  for (const trade of closedTrades) {
    const raw = groupValue(trade, by);
    const label = normalizeLabel(raw);
    const key = String(raw ?? "unspecified");
    const pnl = tradePnl(trade);
    const risk = tradeRisk(trade);
    const entry = groups.get(key) ?? {
      key,
      label,
      trades: 0,
      winners: 0,
      losers: 0,
      breakeven: 0,
      winRate: 0,
      netPnl: 0,
      avgPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      averageRMultiple: null,
      grossProfit: 0,
      grossLossAbs: 0,
      rTotal: 0,
      rCount: 0,
    };

    entry.trades += 1;
    entry.netPnl += pnl;

    if (pnl > 0) {
      entry.winners += 1;
      entry.grossProfit += pnl;
    } else if (pnl < 0) {
      entry.losers += 1;
      entry.grossLossAbs += Math.abs(pnl);
    } else {
      entry.breakeven += 1;
    }

    if (risk) {
      entry.rTotal += pnl / risk;
      entry.rCount += 1;
    }

    groups.set(key, entry);
  }

  return {
    period: filters.period,
    range: formatRange(filters),
    by,
    items: [...groups.values()]
      .map((entry) => {
        const avgWin = entry.winners > 0 ? entry.grossProfit / entry.winners : 0;
        const avgLoss = entry.losers > 0 ? -entry.grossLossAbs / entry.losers : 0;
        return {
          key: entry.key,
          label: entry.label,
          trades: entry.trades,
          winners: entry.winners,
          losers: entry.losers,
          breakeven: entry.breakeven,
          winRate: entry.trades > 0 ? (entry.winners / entry.trades) * 100 : 0,
          netPnl: entry.netPnl,
          avgPnl: entry.trades > 0 ? entry.netPnl / entry.trades : 0,
          avgWin,
          avgLoss,
          profitFactor:
            entry.grossLossAbs === 0
              ? entry.grossProfit > 0
                ? Number.POSITIVE_INFINITY
                : 0
              : entry.grossProfit / entry.grossLossAbs,
          averageRMultiple: entry.rCount > 0 ? entry.rTotal / entry.rCount : null,
        };
      })
      .sort((a, b) => b.netPnl - a.netPnl),
  };
}
