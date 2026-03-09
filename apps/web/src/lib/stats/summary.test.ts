import { describe, expect, it } from "vitest";

import { buildSummary } from "./summary";
import type { StatsQuery, StatsTrade } from "./types";

function makeTrade(overrides: Partial<StatsTrade>): StatsTrade {
  return {
    id: overrides.id ?? "trade-default",
    symbol: overrides.symbol ?? "AAPL",
    assetClass: overrides.assetClass ?? "STOCK",
    side: overrides.side ?? "LONG",
    status: overrides.status ?? "CLOSED",
    setupName: overrides.setupName ?? null,
    entryTimeframe: overrides.entryTimeframe ?? null,
    higherTimeframeBias: overrides.higherTimeframeBias ?? null,
    strategyTag: overrides.strategyTag ?? null,
    emotionalState: overrides.emotionalState ?? null,
    executionRating: overrides.executionRating ?? null,
    planFollowed: overrides.planFollowed ?? null,
    openedAt: overrides.openedAt ?? new Date("2026-03-01T14:00:00.000Z"),
    closedAt: overrides.closedAt ?? new Date("2026-03-01T18:00:00.000Z"),
    netPnl: overrides.netPnl ?? 100,
    riskAmount: overrides.riskAmount ?? 50,
  };
}

const filters: StatsQuery = {
  accountId: "acc-1",
  period: "30D",
  from: new Date("2026-03-01T00:00:00.000Z"),
  to: new Date("2026-03-30T23:59:59.999Z"),
};

describe("buildSummary", () => {
  it("computes realized metrics and activity counts", () => {
    const activity = [
      makeTrade({ id: "1", status: "OPEN", netPnl: null, closedAt: null }),
      makeTrade({ id: "2", netPnl: 150 }),
      makeTrade({ id: "3", netPnl: -50 }),
      makeTrade({ id: "4", netPnl: 0 }),
    ];
    const closed = activity.filter((trade) => trade.status === "CLOSED");

    const summary = buildSummary(filters, activity, closed);

    expect(summary.activity.totalTrades).toBe(4);
    expect(summary.activity.openTrades).toBe(1);
    expect(summary.realized.closedTrades).toBe(3);
    expect(summary.realized.netPnl).toBe(100);
    expect(summary.realized.winners).toBe(1);
    expect(summary.realized.losers).toBe(1);
    expect(summary.realized.breakeven).toBe(1);
    expect(summary.realized.winRate).toBeCloseTo(33.333, 2);
    expect(summary.realized.profitFactor).toBe(3);
  });
});
