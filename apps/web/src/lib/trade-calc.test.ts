import { describe, expect, it } from "vitest";

import { computeNetPnl, computeTradeOutcome, defaultContractMultiplier } from "./trade-calc";

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

  it("falls back to 1 when unknown", () => {
    expect(defaultContractMultiplier("FUTURES", "UNKNOWN")).toBe(1);
    expect(defaultContractMultiplier("STOCK", "AAPL")).toBe(1);
  });
});
