import { describe, expect, it } from "vitest";

import { buildEquity } from "./equity";
import type { ResolvedStatsFilters, StatsTrade } from "./types";

const filters: ResolvedStatsFilters = {
  userId: "user-1",
  accountId: "acc-1",
  period: "30D",
  from: new Date("2026-03-01T00:00:00.000Z"),
  to: new Date("2026-03-30T23:59:59.999Z"),
  groupBy: "day",
};

const trades: StatsTrade[] = [
  {
    id: "1",
    symbol: "AAPL",
    assetClass: "STOCK",
    side: "LONG",
    status: "CLOSED",
    setupName: null,
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: null,
    emotionalState: null,
    executionRating: null,
    planFollowed: null,
    openedAt: new Date("2026-03-01T14:00:00.000Z"),
    closedAt: new Date("2026-03-01T15:00:00.000Z"),
    netPnl: 100,
    riskAmount: 50,
  },
  {
    id: "2",
    symbol: "TSLA",
    assetClass: "STOCK",
    side: "SHORT",
    status: "CLOSED",
    setupName: null,
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: null,
    emotionalState: null,
    executionRating: null,
    planFollowed: null,
    openedAt: new Date("2026-03-01T16:00:00.000Z"),
    closedAt: new Date("2026-03-01T17:00:00.000Z"),
    netPnl: -20,
    riskAmount: 25,
  },
  {
    id: "3",
    symbol: "NVDA",
    assetClass: "STOCK",
    side: "LONG",
    status: "CLOSED",
    setupName: null,
    entryTimeframe: null,
    higherTimeframeBias: null,
    strategyTag: null,
    emotionalState: null,
    executionRating: null,
    planFollowed: null,
    openedAt: new Date("2026-03-02T14:00:00.000Z"),
    closedAt: new Date("2026-03-02T15:00:00.000Z"),
    netPnl: 40,
    riskAmount: 20,
  },
];

describe("buildEquity", () => {
  it("groups pnl by date and accumulates cumulative net", () => {
    const result = buildEquity(filters, trades);

    expect(result.totalNetPnl).toBe(120);
    expect(result.cumulativeSeries).toEqual([
      { key: "2026-03-01", label: "03/01", pnl: 80, cumulativePnl: 80, cumulativePercent: null, tradeCount: 2 },
      { key: "2026-03-02", label: "03/02", pnl: 40, cumulativePnl: 120, cumulativePercent: null, tradeCount: 1 },
    ]);
  });

  it("builds a 14-day calendar series with zero-filled gaps", () => {
    const result = buildEquity(filters, trades);

    expect(result.recentDailySeries).toHaveLength(14);
    expect(result.recentDailySeries[0]).toEqual({
      key: "2026-03-17",
      label: "03/17",
      pnl: 0,
      cumulativePnl: 0,
      cumulativePercent: null,
      tradeCount: 0,
    });
    expect(result.recentDailySeries[13]).toEqual({
      key: "2026-03-30",
      label: "03/30",
      pnl: 0,
      cumulativePnl: 0,
      cumulativePercent: null,
      tradeCount: 0,
    });
  });
});
