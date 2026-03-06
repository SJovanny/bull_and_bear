import type { AssetClass, TradeSide } from "@prisma/client";

export function defaultContractMultiplier(assetClass: AssetClass, symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  if (assetClass === "OPTIONS") {
    return 100;
  }

  if (assetClass === "FUTURES") {
    const knownMultipliers: Record<string, number> = {
      ES: 50,
      MES: 5,
      NQ: 20,
      MNQ: 2,
      YM: 5,
      RTY: 50,
      M2K: 5,
      CL: 1000,
      MCL: 100,
      GC: 100,
      MGC: 10,
      SI: 5000,
      HG: 25000,
      NG: 10000,
    };

    return knownMultipliers[normalized] ?? 1;
  }

  return 1;
}

export function computeNetPnl(params: {
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees: number;
  contractMultiplier: number;
}) {
  const { side, entryPrice, exitPrice, quantity, fees, contractMultiplier } = params;
  const delta = exitPrice - entryPrice;
  const directionalDelta = side === "LONG" ? delta : -delta;
  const gross = directionalDelta * quantity * contractMultiplier;

  return gross - fees;
}

export function computeTradeOutcome(netPnl: number) {
  if (netPnl > 0) return "WIN" as const;
  if (netPnl < 0) return "LOSS" as const;
  return "BREAKEVEN" as const;
}
