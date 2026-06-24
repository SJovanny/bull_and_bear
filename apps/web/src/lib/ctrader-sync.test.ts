/**
 * Tests for ctrader-sync.ts
 *
 * Covers:
 *  - Volume → lots conversion using lotSize
 *  - Swap sign handling (credit vs debit)
 *  - Side mapping (BUY → LONG, SELL → SHORT)
 *  - Open position mapping
 *  - Open positions with no entry price are skipped
 *  - Deals without closePositionDetail are skipped (still open)
 *  - moneyDigits exponent applied correctly
 */

import { describe, expect, it } from "vitest";

import type { CTraderDeal, CTraderPosition, CTraderSymbol } from "./ctrader-api";
import { mapDealsToTrades, mapPositionsToOpenTrades } from "./ctrader-sync";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSymbolMap(entries: CTraderSymbol[]): Map<number, CTraderSymbol> {
  return new Map(entries.map((s) => [s.symbolId, s]));
}

const EURUSD: CTraderSymbol = { symbolId: 1, symbolName: "EURUSD", lotSize: 10_000_000 };
const XAUUSD: CTraderSymbol = { symbolId: 2, symbolName: "XAUUSD", lotSize: 100_000 };
const BTCUSD: CTraderSymbol = { symbolId: 3, symbolName: "BTCUSD", lotSize: 100 };

/** Creates a minimal FILLED closing deal. */
function makeDeal(overrides: Partial<CTraderDeal> & { closePositionDetail: CTraderDeal["closePositionDetail"] }): CTraderDeal {
  return {
    dealId: "d1",
    orderId: "o1",
    positionId: "p1",
    volume: 800_000,
    filledVolume: 800_000,
    symbolId: 1,
    createTimestamp: 1_000_000,
    executionTimestamp: 1_100_000,
    executionPrice: 1.14344,
    tradeSide: 1,
    dealStatus: 2,
    commission: 0,
    moneyDigits: 2,
    ...overrides,
  };
}

// ─── mapDealsToTrades ─────────────────────────────────────────────────────────

describe("mapDealsToTrades", () => {
  it("converts filledVolume to lots correctly using lotSize", () => {
    // 0.80 lots of EURUSD: filledVolume = 8_000_000 centilots, lotSize = 10_000_000
    const openDeal = makeDeal({
      positionId: "p1",
      filledVolume: 8_000_000,
      executionTimestamp: 1_000_000,
      tradeSide: 1,
      closePositionDetail: undefined,
    });
    const closeDeal = makeDeal({
      positionId: "p1",
      filledVolume: 8_000_000,
      executionTimestamp: 1_100_000,
      tradeSide: 2,
      closePositionDetail: {
        entryPrice: 1.14344,
        grossProfit: 28322, // in cents (moneyDigits=2) → 283.22 before fees
        swap: 0,
        commission: 0,
        balance: 0,
        closedVolume: 8_000_000,
      },
    });

    const { trades } = mapDealsToTrades([openDeal, closeDeal], makeSymbolMap([EURUSD]));

    expect(trades).toHaveLength(1);
    expect(trades[0]!.quantity).toBeCloseTo(0.8, 5);
    expect(trades[0]!.symbol).toBe("EURUSD");
    expect(trades[0]!.side).toBe("LONG");
    expect(trades[0]!.status).toBe("CLOSED");
  });

  it("converts XAUUSD volume to lots (lotSize=100000 → 0.01 lot)", () => {
    // 0.01 lot XAUUSD: filledVolume = 1_000 (if lotSize=100_000)
    const deal = makeDeal({
      positionId: "p2",
      symbolId: 2,
      filledVolume: 1_000,
      tradeSide: 1,
      closePositionDetail: {
        entryPrice: 4104.82,
        grossProfit: -9262, // -92.62 after applying moneyDigits=2
        swap: -58,          // -0.58 swap debit
        commission: 0,
        balance: 0,
        closedVolume: 1_000,
      },
    });

    const { trades } = mapDealsToTrades([deal], makeSymbolMap([XAUUSD]));

    expect(trades[0]!.quantity).toBeCloseTo(0.01, 5);
    expect(trades[0]!.symbol).toBe("XAUUSD");
    // netPnl = grossProfit - |commission| + swap = -92.62 - 0 + (-0.58) = -93.20
    expect(trades[0]!.netPnl).toBeCloseTo(-93.2, 2);
    expect(trades[0]!.fees).toBeCloseTo(0.58, 2); // only debit swap counts as fee
  });

  it("adds positive swap credit to PnL (not subtract it)", () => {
    // EURUSD SHORT, swap credit of +0.13
    // grossProfit (cents, moneyDigits=2): 6222 → 62.22
    // swap (cents): +13 → +0.13 credit
    // expected netPnl = 62.22 - 0 + 0.13 = 62.35
    const deal = makeDeal({
      positionId: "p3",
      tradeSide: 2,
      closePositionDetail: {
        entryPrice: 1.15699,
        grossProfit: 6222,
        swap: 13,     // positive = credit
        commission: 0,
        balance: 0,
        closedVolume: 0,
      },
    });

    const { trades } = mapDealsToTrades([deal], makeSymbolMap([EURUSD]));

    expect(trades[0]!.side).toBe("SHORT");
    expect(trades[0]!.netPnl).toBeCloseTo(62.35, 2);
    // Credit swap → fees should be 0 (no debit)
    expect(trades[0]!.fees).toBe(0);
  });

  it("subtracts negative swap debit from PnL and records it in fees", () => {
    // swap debit of -36.02 (BTCUSD)
    // grossProfit: -18607 cents → -186.07
    // swap: -3602 cents → -36.02 debit
    // commission: 0
    // expected netPnl = -186.07 - 0 + (-36.02) = -222.09
    const deal = makeDeal({
      positionId: "p4",
      symbolId: 3,
      filledVolume: 20,           // 0.20 lots of BTC (lotSize=100)
      tradeSide: 2,
      moneyDigits: 2,
      closePositionDetail: {
        entryPrice: 63382.06,
        grossProfit: -18607,
        swap: -3602,
        commission: 0,
        balance: 0,
        closedVolume: 20,
      },
    });

    const { trades } = mapDealsToTrades([deal], makeSymbolMap([BTCUSD]));

    expect(trades[0]!.netPnl).toBeCloseTo(-222.09, 2);
    expect(trades[0]!.fees).toBeCloseTo(36.02, 2);
    expect(trades[0]!.quantity).toBeCloseTo(0.2, 5);
  });

  it("applies moneyDigits exponent correctly (moneyDigits=8)", () => {
    // moneyDigits=8 means divide by 10^8
    // grossProfit = 10_000_000 → 0.10 in currency units
    // commission = 500_000 → 0.005
    // netPnl = 0.10 - 0.005 = 0.095
    const deal = makeDeal({
      positionId: "p5",
      moneyDigits: 8,
      closePositionDetail: {
        entryPrice: 1.14344,
        grossProfit: 10_000_000,
        swap: 0,
        commission: 500_000,
        balance: 0,
        closedVolume: 0,
      },
    });

    const { trades } = mapDealsToTrades([deal], makeSymbolMap([EURUSD]));

    expect(trades[0]!.netPnl).toBeCloseTo(0.095, 6);
    expect(trades[0]!.fees).toBeCloseTo(0.005, 6);
  });

  it("skips deals without closePositionDetail (still open)", () => {
    const openDeal = makeDeal({
      positionId: "p6",
      closePositionDetail: undefined,
    });

    const { trades, skippedOpen } = mapDealsToTrades([openDeal], makeSymbolMap([EURUSD]));

    expect(trades).toHaveLength(0);
    expect(skippedOpen).toBe(1);
  });

  it("reconstructs trade from multiple deals for the same position", () => {
    // Position opened by deal1, closed by deal2
    const deal1 = makeDeal({
      positionId: "p7",
      executionTimestamp: 1_000_000,
      tradeSide: 1,
      closePositionDetail: undefined,
    });
    const deal2 = makeDeal({
      positionId: "p7",
      executionTimestamp: 1_500_000,
      tradeSide: 2,
      closePositionDetail: {
        entryPrice: 1.14344,
        grossProfit: 5000,
        swap: 0,
        commission: 100,
        balance: 0,
        closedVolume: 0,
      },
    });

    const { trades } = mapDealsToTrades([deal1, deal2], makeSymbolMap([EURUSD]));

    expect(trades).toHaveLength(1);
    expect(trades[0]!.openedAt.getTime()).toBe(1_000_000);
    expect(trades[0]!.closedAt.getTime()).toBe(1_500_000);
    expect(trades[0]!.side).toBe("LONG"); // from opening deal
  });

  it("generates stable importSourceTradeId from positionId", () => {
    const deal = makeDeal({
      positionId: "7555457",
      closePositionDetail: {
        entryPrice: 1.1,
        grossProfit: 1000,
        swap: 0,
        commission: 0,
        balance: 0,
        closedVolume: 0,
      },
    });

    const { trades } = mapDealsToTrades([deal], makeSymbolMap([EURUSD]));

    expect(trades[0]!.importSourceTradeId).toBe("7555457");
    expect(trades[0]!.importSource).toBe("CTRADER");
  });

  it("falls back to default lotSize when symbol not in map", () => {
    // filledVolume = 8_000_000, no symbol in map → lotSize defaults to 10_000_000
    // 8_000_000 / 10_000_000 = 0.80
    const deal = makeDeal({
      symbolId: 999,
      closePositionDetail: {
        entryPrice: 1.1,
        grossProfit: 1000,
        swap: 0,
        commission: 0,
        balance: 0,
        closedVolume: 0,
      },
    });
    deal.filledVolume = 8_000_000;

    const { trades } = mapDealsToTrades([deal], new Map());

    expect(trades[0]!.quantity).toBeCloseTo(0.8, 5);
  });
});

// ─── mapPositionsToOpenTrades ─────────────────────────────────────────────────

describe("mapPositionsToOpenTrades", () => {
  function makePosition(overrides: Partial<CTraderPosition> = {}): CTraderPosition {
    return {
      positionId: "pos1",
      tradeData: {
        symbolId: 1,
        volume: 8_000_000,
        tradeSide: 1,
        openTimestamp: 1_700_000_000_000,
        comment: "test",
      },
      price: 1.14344,
      commission: 0,
      swap: 0,
      moneyDigits: 2,
      ...overrides,
    };
  }

  it("maps a LONG open position correctly", () => {
    const pos = makePosition();
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts).toHaveLength(1);
    expect(drafts[0]!.status).toBe("OPEN");
    expect(drafts[0]!.side).toBe("LONG");
    expect(drafts[0]!.symbol).toBe("EURUSD");
    expect(drafts[0]!.quantity).toBeCloseTo(0.8, 5);
    expect(drafts[0]!.entryPrice).toBe(1.14344);
    expect(drafts[0]!.exitPrice).toBeNull();
    expect(drafts[0]!.closedAt).toBeNull();
    expect(drafts[0]!.netPnl).toBeNull();
  });

  it("maps a SHORT open position correctly", () => {
    const pos = makePosition({ tradeData: { symbolId: 1, volume: 2_500_000, tradeSide: 2, openTimestamp: 1_700_000_000_000 } });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts[0]!.side).toBe("SHORT");
    expect(drafts[0]!.quantity).toBeCloseTo(0.25, 5);
  });

  it("uses a stable fingerprint keyed on positionId", () => {
    const pos = makePosition({ positionId: "abc123" });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts[0]!.importFingerprint).toBe("CTRADER_API_OPEN|abc123");
    expect(drafts[0]!.importSourceTradeId).toBe("abc123");
  });

  it("skips positions with no entry price", () => {
    const pos = makePosition({ price: undefined });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts).toHaveLength(0);
  });

  it("handles swap debit on open position — adds to fees", () => {
    // swap debit: -309 cents / 10^2 = -3.09
    const pos = makePosition({ swap: -309, moneyDigits: 2 });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts[0]!.fees).toBeCloseTo(3.09, 2);
  });

  it("handles swap credit on open position — fees stay at 0", () => {
    // swap credit: +13 cents / 10^2 = +0.13
    const pos = makePosition({ swap: 13, moneyDigits: 2 });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([EURUSD]));

    expect(drafts[0]!.fees).toBe(0); // credit swap is not a fee
  });

  it("maps XAUUSD open position with correct lot conversion", () => {
    // 0.04 lots XAUUSD: volume = 4_000 (lotSize=100_000)
    const pos = makePosition({
      tradeData: { symbolId: 2, volume: 4_000, tradeSide: 1, openTimestamp: 1_700_000_000_000 },
      price: 4104.82,
    });
    const drafts = mapPositionsToOpenTrades([pos], makeSymbolMap([XAUUSD]));

    expect(drafts[0]!.quantity).toBeCloseTo(0.04, 5);
    expect(drafts[0]!.symbol).toBe("XAUUSD");
    expect(drafts[0]!.assetClass).toBe("CFD");
  });
});
