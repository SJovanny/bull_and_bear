import { describe, expect, it } from "vitest";

import { buildTimeAnalysis } from "./time-analysis";
import type { StatsQuery, StatsTrade } from "./types";

const filters: StatsQuery = {
  userId: "user-1",
  accountId: "acc-1",
  period: "ALL",
  from: null,
  to: null,
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
    openedAt: new Date("2026-03-02T13:00:00.000Z"),
    closedAt: new Date("2026-03-02T14:00:00.000Z"),
    netPnl: 50,
    riskAmount: 25,
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
    openedAt: new Date("2026-03-03T13:00:00.000Z"),
    closedAt: new Date("2026-03-03T14:00:00.000Z"),
    netPnl: -20,
    riskAmount: 10,
  },
];

describe("buildTimeAnalysis", () => {
  it("aggregates weekday and hourly stats", () => {
    const result = buildTimeAnalysis(filters, trades);

    expect(result.weekday.find((bucket) => bucket.label === "Mon")?.netPnl).toBe(50);
    expect(result.weekday.find((bucket) => bucket.label === "Tue")?.netPnl).toBe(-20);
    expect(result.hourly.find((bucket) => bucket.label === "14:00")?.trades).toBe(2);
    expect(result.monthly).toHaveLength(1);
  });
});
