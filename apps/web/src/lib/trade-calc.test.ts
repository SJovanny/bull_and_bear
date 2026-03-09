import { describe, expect, it } from "vitest";

import {
  computeNetPnl,
  computePipInfo,
  computeTradeOutcome,
  convertForexPnl,
  defaultContractMultiplier,
  pipSize,
  quoteCurrency,
} from "./trade-calc";

describe("computeNetPnl", () => {
  it("calculates LONG stock-like pnl with multiplier=1", () => {
    const pnl = computeNetPnl({
      side: "LONG",
      entryPrice: 100,
      exitPrice: 110,
      quantity: 2,
      contractMultiplier: 1,
      fees: 1,
    });

    expect(pnl).toBe(19);
  });

  it("calculates SHORT stock-like pnl with multiplier=1", () => {
    const pnl = computeNetPnl({
      side: "SHORT",
      entryPrice: 100,
      exitPrice: 90,
      quantity: 2,
      contractMultiplier: 1,
      fees: 1,
    });

    expect(pnl).toBe(19);
  });

  it("calculates futures pnl using contract multiplier", () => {
    const pnl = computeNetPnl({
      side: "LONG",
      entryPrice: 20000,
      exitPrice: 20010,
      quantity: 1,
      contractMultiplier: 20,
      fees: 4,
    });

    expect(pnl).toBe(196);
  });

  it("returns loss when movement goes against side", () => {
    const pnl = computeNetPnl({
      side: "LONG",
      entryPrice: 50,
      exitPrice: 45,
      quantity: 3,
      contractMultiplier: 1,
      fees: 0,
    });

    expect(pnl).toBe(-15);
  });

  it("supports decimal losses", () => {
    const pnl = computeNetPnl({
      side: "LONG",
      entryPrice: 100.5,
      exitPrice: 99.25,
      quantity: 2.5,
      contractMultiplier: 1,
      fees: 0.5,
    });

    expect(pnl).toBe(-3.625);
  });

  it("calculates forex pnl with standard lot multiplier", () => {
    const pnl = computeNetPnl({
      side: "LONG",
      entryPrice: 1.1581,
      exitPrice: 1.1561,
      quantity: 1,
      contractMultiplier: 100000,
      fees: 0,
    });

    expect(pnl).toBeCloseTo(-200, 8);
  });
});

describe("computeTradeOutcome", () => {
  it("maps positive pnl to WIN", () => {
    expect(computeTradeOutcome(0.01)).toBe("WIN");
  });

  it("maps negative pnl to LOSS", () => {
    expect(computeTradeOutcome(-0.01)).toBe("LOSS");
  });

  it("maps zero pnl to BREAKEVEN", () => {
    expect(computeTradeOutcome(0)).toBe("BREAKEVEN");
  });
});

describe("defaultContractMultiplier", () => {
  it("defaults options to 100", () => {
    expect(defaultContractMultiplier("OPTIONS", "AAPL240621C00190000")).toBe(100);
  });

  it("maps known futures symbols", () => {
    expect(defaultContractMultiplier("FUTURES", "NQ")).toBe(20);
    expect(defaultContractMultiplier("FUTURES", "ES")).toBe(50);
  });

  it("defaults forex to standard lot size", () => {
    expect(defaultContractMultiplier("FOREX", "EURUSD")).toBe(100000);
  });

  it("falls back to 1 when unknown", () => {
    expect(defaultContractMultiplier("FUTURES", "UNKNOWN")).toBe(1);
    expect(defaultContractMultiplier("STOCK", "AAPL")).toBe(1);
  });
});

describe("pipSize and computePipInfo", () => {
  it("uses 0.01 for JPY pairs and 0.0001 for others", () => {
    expect(pipSize("USDJPY")).toBe(0.01);
    expect(pipSize("GBPJPY")).toBe(0.01);
    expect(pipSize("EURUSD")).toBe(0.0001);
    expect(pipSize("GBPUSD")).toBe(0.0001);
  });

  it("calculates pip value and moves correctly for EURUSD", () => {
    const info = computePipInfo({
      symbol: "EURUSD",
      side: "LONG",
      entryPrice: 1.1581,
      exitPrice: 1.1561,
      quantity: 1,
      contractMultiplier: 100000,
    });

    expect(info.pipValue).toBeCloseTo(10, 2);
    expect(info.pipsMove).toBeCloseTo(-20, 2);
  });

  it("calculates pip value and moves correctly for USDJPY", () => {
    const info = computePipInfo({
      symbol: "USDJPY",
      side: "SHORT",
      entryPrice: 150.5,
      exitPrice: 150.0,
      quantity: 0.1,
      contractMultiplier: 100000,
    });

    expect(info.pipValue).toBeCloseTo(100, 2);
    expect(info.pipsMove).toBeCloseTo(50, 2);
  });
});

describe("convertForexPnl", () => {
  it("keeps pnl unchanged when quote currency matches account currency", () => {
    expect(convertForexPnl({
      symbol: "EURUSD",
      accountCurrency: "USD",
      rawPnl: -200,
      exitPrice: 1.1561,
    })).toEqual({ converted: -200, currency: "USD" });
  });

  it("converts pnl approximately when base currency matches account currency", () => {
    const converted = convertForexPnl({
      symbol: "EURUSD",
      accountCurrency: "EUR",
      rawPnl: -200,
      exitPrice: 1.1561,
    });

    expect(converted?.currency).toBe("EUR");
    expect(converted?.converted ?? 0).toBeCloseTo(-172.9954, 3);
  });

  it("returns null when neither leg matches account currency", () => {
    expect(convertForexPnl({
      symbol: "GBPJPY",
      accountCurrency: "EUR",
      rawPnl: -5000,
      exitPrice: 190.5,
    })).toBeNull();
  });

  it("converts USDJPY pnl back to USD when account currency is USD", () => {
    const converted = convertForexPnl({
      symbol: "USDJPY",
      accountCurrency: "USD",
      rawPnl: 5000,
      exitPrice: 150,
    });

    expect(converted?.currency).toBe("USD");
    expect(converted?.converted ?? 0).toBeCloseTo(33.33, 2);
  });
});

describe("quoteCurrency", () => {
  it("extracts the quote currency from a forex pair", () => {
    expect(quoteCurrency("EURUSD")).toBe("USD");
    expect(quoteCurrency("USDJPY")).toBe("JPY");
  });
});
