import type { AssetClass, TradeSide } from "@prisma/client";

import { FUTURES_MULTIPLIERS, normalizeFuturesRoot } from "./symbol-database";

function normalizedSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export function baseCurrency(symbol: string) {
  const normalized = normalizedSymbol(symbol);
  return normalized.length >= 6 ? normalized.slice(0, 3) : "";
}

export function quoteCurrency(symbol: string) {
  const normalized = normalizedSymbol(symbol);
  return normalized.length >= 6 ? normalized.slice(3, 6) : "";
}

export function defaultContractMultiplier(assetClass: AssetClass, symbol: string) {
  const normalized = normalizedSymbol(symbol);

  if (assetClass === "OPTIONS") {
    return 100;
  }

  if (assetClass === "FOREX") {
    return 100000;
  }

  if (assetClass === "FUTURES") {
    return FUTURES_MULTIPLIERS[normalizeFuturesRoot(normalized)] ?? 1;
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

export function pipSize(symbol: string): number {
  return normalizedSymbol(symbol).includes("JPY") ? 0.01 : 0.0001;
}

function movementUnitSize(assetClass: AssetClass, symbol: string): number {
  if (assetClass === "FOREX") {
    return pipSize(symbol);
  }

  return 1;
}

export function computePipInfo(params: {
  assetClass: AssetClass;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  contractMultiplier: number;
}) {
  const { assetClass, symbol, side, entryPrice, exitPrice, quantity, contractMultiplier } = params;
  const unitSize = movementUnitSize(assetClass, symbol);
  const unitValuePerLot = unitSize * contractMultiplier;
  const unitValue = unitValuePerLot * quantity;
  const rawUnits = (exitPrice - entryPrice) / unitSize;
  const unitsMove = side === "LONG" ? rawUnits : -rawUnits;

  return {
    unit: assetClass === "FOREX" ? ("pips" as const) : ("pts" as const),
    unitSize,
    unitValue,
    unitsMove,
  };
}

export function convertForexPnl(params: {
  symbol: string;
  accountCurrency: string;
  rawPnl: number;
  exitPrice: number;
}) {
  const base = baseCurrency(params.symbol);
  const quote = quoteCurrency(params.symbol);
  const accountCurrency = params.accountCurrency.trim().toUpperCase();

  if (!base || !quote || !accountCurrency || !Number.isFinite(params.exitPrice) || params.exitPrice === 0) {
    return null;
  }

  if (quote === accountCurrency) {
    return {
      converted: params.rawPnl,
      currency: accountCurrency,
    };
  }

  if (base === accountCurrency) {
    return {
      converted: params.rawPnl / params.exitPrice,
      currency: accountCurrency,
    };
  }

  return null;
}
