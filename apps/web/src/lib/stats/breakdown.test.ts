import { describe, expect, it } from "vitest";

import { buildBreakdown } from "./breakdown";
import type { ResolvedStatsFilters, StatsTrade } from "./types";

const filters: ResolvedStatsFilters = {
  userId: "user-1",
  accountId: "acc-1",
  period: "ALL",
  from: null,
  to: null,
  breakdownBy: "symbol",
};

const trades: StatsTrade[] = [
  {
    id: "1",
    symbol: "AAPL",
    assetClass: "STOCK",
    side: "LONG",
    status: "CLOSED",
    setupName: "breakout",
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: "trend",
    emotionalState: null,
    executionRating: 4,
    planFollowed: true,
    openedAt: new Date("2026-03-01T14:00:00.000Z"),
    closedAt: new Date("2026-03-01T15:00:00.000Z"),
    netPnl: 100,
    riskAmount: 50,
  },
  {
    id: "2",
    symbol: "AAPL",
    assetClass: "STOCK",
    side: "LONG",
    status: "CLOSED",
    setupName: "breakout",
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: "trend",
    emotionalState: null,
    executionRating: 3,
    planFollowed: true,
    openedAt: new Date("2026-03-02T14:00:00.000Z"),
    closedAt: new Date("2026-03-02T15:00:00.000Z"),
    netPnl: -50,
    riskAmount: 25,
  },
  {
    id: "3",
    symbol: "TSLA",
    assetClass: "STOCK",
    side: "SHORT",
    status: "CLOSED",
    setupName: "reversal",
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: "fade",
    emotionalState: null,
    executionRating: 5,
    planFollowed: false,
    openedAt: new Date("2026-03-03T14:00:00.000Z"),
    closedAt: new Date("2026-03-03T15:00:00.000Z"),
    netPnl: 60,
    riskAmount: 30,
  },
];

describe("buildBreakdown", () => {
  it("groups trades and calculates aggregated metrics", () => {
    const result = buildBreakdown(filters, trades);

    const aapl = result.items.find((item) => item.key === "AAPL");
    const tsla = result.items.find((item) => item.key === "TSLA");

    expect(aapl).toMatchObject({
      key: "AAPL",
      trades: 2,
      netPnl: 50,
      winners: 1,
      losers: 1,
      averageRMultiple: 0,
    });
    expect(tsla).toMatchObject({
      key: "TSLA",
      trades: 1,
      netPnl: 60,
      averageRMultiple: 2,
    });
  });
});
