import { describe, expect, it } from "vitest";

import { buildDistribution } from "./distribution";

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
    openedAt: new Date("2026-03-01T10:00:00.000Z"),
    closedAt: new Date("2026-03-01T12:00:00.000Z"),
    netPnl: 100,
    riskAmount: 50,
  },
  {
    id: "2",
    symbol: "TSLA",
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
    openedAt: new Date("2026-03-01T13:00:00.000Z"),
    closedAt: new Date("2026-03-01T17:00:00.000Z"),
    netPnl: -25,
    riskAmount: 25,
  },
];

describe("buildDistribution", () => {
  it("builds pnl histogram payload", () => {
    const result = buildDistribution(
      {
        userId: "user-1",
        accountId: "acc-1",
        period: "ALL",
        from: null,
        to: null,
        distributionMetric: "pnl",
      },
      trades,
    );

    expect(result.sampleCount).toBe(2);
    expect(result.average).toBe(37.5);
    expect(result.min).toBe(-25);
    expect(result.max).toBe(100);
    expect(result.bins.length).toBeGreaterThan(0);
  });

  it("supports holding time values", () => {
    const result = buildDistribution(
      {
        userId: "user-1",
        accountId: "acc-1",
        period: "ALL",
        from: null,
        to: null,
        distributionMetric: "holdingTime",
      },
      trades,
    );

    expect(result.unit).toBe("hours");
    expect(result.average).toBe(3);
  });
});
