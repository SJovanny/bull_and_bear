import { describe, expect, it } from "vitest";

import { buildCumulativePnlSeries } from "./dashboard-metrics";
import type { Trade } from "../types";

function makeTrade(overrides: Partial<Trade>): Trade {
  const hasClosedAt = Object.prototype.hasOwnProperty.call(overrides, "closedAt");
  const hasRiskAmount = Object.prototype.hasOwnProperty.call(overrides, "riskAmount");

  return {
    id: overrides.id ?? "trade-1",
    symbol: overrides.symbol ?? "AAPL",
    side: overrides.side ?? "LONG",
    quantity: overrides.quantity ?? "1",
    entryPrice: overrides.entryPrice ?? "100",
    exitPrice: overrides.exitPrice ?? "101",
    status: overrides.status ?? "CLOSED",
    openedAt: overrides.openedAt ?? "2026-09-12T13:00:00.000Z",
    closedAt: hasClosedAt ? (overrides.closedAt ?? null) : "2026-09-12T14:00:00.000Z",
    netPnl: overrides.netPnl ?? "25",
    riskAmount: hasRiskAmount ? (overrides.riskAmount ?? null) : null,
  };
}

describe("buildCumulativePnlSeries", () => {
  it("groups closed trades by close date and accumulates pnl", () => {
    const series = buildCumulativePnlSeries([
      makeTrade({
        id: "t2",
        openedAt: "2026-09-13T09:00:00.000Z",
        closedAt: "2026-09-13T16:00:00.000Z",
        netPnl: "40",
      }),
      makeTrade({
        id: "t1",
        openedAt: "2026-09-12T08:00:00.000Z",
        closedAt: "2026-09-12T12:00:00.000Z",
        netPnl: "25",
      }),
      makeTrade({
        id: "t3",
        openedAt: "2026-09-13T10:00:00.000Z",
        closedAt: "2026-09-13T18:00:00.000Z",
        netPnl: "-10",
      }),
    ]);

    expect(series).toEqual([
      {
        date: "2026-09-12",
        label: "09/12",
        pnl: 25,
        cumulativePnl: 25,
        cumulativePercent: 0.25,
      },
      {
        date: "2026-09-13",
        label: "09/13",
        pnl: 30,
        cumulativePnl: 55,
        cumulativePercent: 0.55,
      },
    ]);
  });

  it("ignores open trades and falls back to openedAt when closedAt is missing", () => {
    const series = buildCumulativePnlSeries([
      makeTrade({
        id: "t1",
        status: "OPEN",
        closedAt: null,
        openedAt: "2026-09-12T09:00:00.000Z",
        netPnl: "100",
      }),
      makeTrade({
        id: "t2",
        closedAt: null,
        openedAt: "2026-09-14T15:00:00.000Z",
        netPnl: "15",
      }),
    ]);

    expect(series).toEqual([
      {
        date: "2026-09-14",
        label: "09/14",
        pnl: 15,
        cumulativePnl: 15,
        cumulativePercent: 0.15,
      },
    ]);
  });
});
