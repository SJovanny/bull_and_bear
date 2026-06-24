/**
 * cTrader deal-to-trade mapper
 *
 * Converts raw cTrader API deals (executions) into ImportedTradeDraft objects
 * compatible with the existing trade-import pipeline and database schema.
 *
 * Core logic:
 *  - Groups deals by positionId
 *  - A position with a closePositionDetail is a CLOSED trade
 *  - The closing deal's closePositionDetail.entryPrice is the w.avg entry
 *  - Monetary values use the moneyDigits exponent: value / 10^moneyDigits
 */

import type { AssetClass, TradeSide } from "@prisma/client";

import type { CTraderDeal, CTraderPosition, CTraderSymbol } from "./ctrader-api";
import {
  extractCompactSymbol,
  isCommoditySymbol,
  isCryptoSymbol,
  isFuturesSymbol,
  isIndexSymbol,
  isKnownForexPair,
} from "./symbol-database";
import { normalizeStoredTradeSymbol } from "./symbol-normalization";
import type { ImportedTradeDraft, OpenTradeDraft } from "./trade-import";

// ─── Asset class inference (mirrors trade-import.ts) ─────────────────────────

function inferAssetClass(symbol: string): AssetClass {
  if (isCommoditySymbol(symbol)) return "CFD";
  if (isCryptoSymbol(symbol)) return "CRYPTO";
  if (isKnownForexPair(symbol)) return "FOREX";
  if (isFuturesSymbol(symbol)) return "FUTURES";
  if (isIndexSymbol(symbol)) return "INDEX";
  const compact = extractCompactSymbol(symbol);
  if (/^[A-Z]{1,5}$/.test(compact)) return "CFD";
  return "CFD";
}

// ─── Monetary value helper ───────────────────────────────────────────────────

function toDecimal(raw: number, moneyDigits: number): number {
  return raw / Math.pow(10, moneyDigits);
}

// ─── Fingerprint ─────────────────────────────────────────────────────────────

function buildFingerprint(
  symbol: string,
  side: TradeSide,
  quantity: number,
  entryPrice: number,
  exitPrice: number,
  openedAt: Date,
  closedAt: Date,
): string {
  return [
    "CTRADER_API",
    symbol,
    side,
    quantity.toFixed(2),
    entryPrice.toFixed(5),
    exitPrice.toFixed(5),
    openedAt.toISOString(),
    closedAt.toISOString(),
  ].join("|");
}

// ─── Main mapper ─────────────────────────────────────────────────────────────

export type CTraderSyncResult = {
  trades: ImportedTradeDraft[];
  /** Deals skipped because they had no closePositionDetail (still open) */
  skippedOpen: number;
  /** Deals that could not be mapped due to missing data */
  skippedErrors: number;
};

/**
 * Convert a flat list of cTrader deals into ImportedTradeDraft objects.
 *
 * @param deals     All deals from the cTrader API for the sync window
 * @param symbolMap Map of symbolId → CTraderSymbol (name + lotSize)
 */
export function mapDealsToTrades(
  deals: CTraderDeal[],
  symbolMap: Map<number, CTraderSymbol>,
): CTraderSyncResult {
  // Group deals by positionId – each position = one trade
  const byPosition = new Map<string, CTraderDeal[]>();

  for (const deal of deals) {
    const pid = String(deal.positionId);
    if (!byPosition.has(pid)) {
      byPosition.set(pid, []);
    }
    byPosition.get(pid)!.push(deal);
  }

  const trades: ImportedTradeDraft[] = [];
  let skippedOpen = 0;
  let skippedErrors = 0;

  for (const [positionId, posDeals] of byPosition.entries()) {
    try {
      // Sort by execution timestamp ascending
      posDeals.sort((a, b) => a.executionTimestamp - b.executionTimestamp);

      // The closing deal has closePositionDetail
      const closingDeal = posDeals.find((d) => d.closePositionDetail != null);
      if (!closingDeal?.closePositionDetail) {
        // Position still open – skip silently
        skippedOpen += 1;
        continue;
      }

      // Opening deal is the earliest one without closePositionDetail
      const openingDeal = posDeals.find((d) => d.closePositionDetail == null) ?? posDeals[0];

      const cpd = closingDeal.closePositionDetail;
      const moneyDigits = closingDeal.moneyDigits ?? 2;

      // Symbol resolution — symbolMap now holds the full CTraderSymbol with lotSize
      const symbolInfo = symbolMap.get(closingDeal.symbolId);
      const rawSymbol = symbolInfo?.symbolName ?? `SYMBOL_${closingDeal.symbolId}`;
      const rawUpper = rawSymbol.trim().toUpperCase();
      const assetClass = inferAssetClass(rawUpper);
      const symbol = normalizeStoredTradeSymbol(rawUpper, assetClass);

      // Side: 1 = BUY (LONG), 2 = SELL (SHORT) — from the OPENING deal
      const side: TradeSide = openingDeal.tradeSide === 1 ? "LONG" : "SHORT";

      // Volume → lots
      // filledVolume is in "cents of units" (1000 = 10 units).
      // lotSize  is also in "cents of units" (e.g. 10,000,000 = 100,000 units for standard forex).
      // lots = filledVolume / lotSize
      const lotSize = symbolInfo?.lotSize ?? 10_000_000;
      const rawVolume = closingDeal.filledVolume ?? closingDeal.volume;
      // Guard against zero lotSize to avoid NaN/Infinity
      const quantity = lotSize > 0 ? rawVolume / lotSize : rawVolume / 10_000_000;

      // Prices
      const entryPrice = cpd.entryPrice;
      const exitPrice = closingDeal.executionPrice;

      if (!entryPrice || !exitPrice) {
        skippedErrors += 1;
        continue;
      }

      // Fees: commission is always a cost — use absolute value.
      // Swap can be a credit (positive) or debit (negative) — preserve its sign.
      // netPnl = grossProfit - |commission| + swap
      //        = grossProfit - |commission| - |swap_debit| + |swap_credit|
      const commission = Math.abs(toDecimal(cpd.commission ?? 0, moneyDigits));
      // cpd.swap is negative when it's a charge, positive when it's a credit.
      const swap = toDecimal(cpd.swap ?? 0, moneyDigits);
      const fees = commission + Math.abs(Math.min(swap, 0)); // only count negative swap as a fee

      // Net PnL: grossProfit (before commission/swap) + swap credit - commission
      // Equivalent to: grossProfit - |commission| + swap (with sign)
      const grossProfit = toDecimal(cpd.grossProfit, moneyDigits);
      const netPnl = grossProfit - commission + swap;

      // Timestamps
      const openedAt = new Date(openingDeal.executionTimestamp);
      const closedAt = new Date(closingDeal.executionTimestamp);

      const importFingerprint = buildFingerprint(
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice,
        openedAt,
        closedAt,
      );

      const draft: ImportedTradeDraft = {
        importSource: "CTRADER",
        importSourceTradeId: positionId,
        importFingerprint,
        assetClass,
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice,
        fees,
        // For cTrader API trades there is no broker-reported multiplier;
        // default to 1 so the stored raw values match what cTrader reports.
        contractMultiplier: 1,
        openedAt,
        closedAt,
        status: "CLOSED",
        netPnl,
        notes: closingDeal.comment ?? openingDeal.comment ?? null,
      };

      trades.push(draft);
    } catch {
      skippedErrors += 1;
    }
  }

  return { trades, skippedOpen, skippedErrors };
}

// ─── Open position mapper ─────────────────────────────────────────────────────

/**
 * Convert currently-open cTrader positions into OpenTradeDraft objects.
 * These are upserted into the DB as status=OPEN trades.
 * When the position closes on the next sync, the deal mapper will update it
 * to status=CLOSED via the shared importSourceTradeId (positionId).
 */
export function mapPositionsToOpenTrades(
  positions: CTraderPosition[],
  symbolMap: Map<number, CTraderSymbol>,
): OpenTradeDraft[] {
  const drafts: OpenTradeDraft[] = [];

  for (const pos of positions) {
    try {
      const { tradeData } = pos;
      const moneyDigits = pos.moneyDigits ?? 2;

      const symbolInfo = symbolMap.get(tradeData.symbolId);
      const rawSymbol = symbolInfo?.symbolName ?? `SYMBOL_${tradeData.symbolId}`;
      const rawUpper = rawSymbol.trim().toUpperCase();
      const assetClass = inferAssetClass(rawUpper);
      const symbol = normalizeStoredTradeSymbol(rawUpper, assetClass);

      const side: TradeSide = tradeData.tradeSide === 1 ? "LONG" : "SHORT";

      const lotSize = symbolInfo?.lotSize ?? 10_000_000;
      const quantity = lotSize > 0 ? tradeData.volume / lotSize : tradeData.volume / 10_000_000;

      const entryPrice = pos.price ?? 0;
      if (!entryPrice) continue;

      const openedAt = tradeData.openTimestamp
        ? new Date(tradeData.openTimestamp)
        : new Date();

      // Unrealized fees: commission (always cost) + swap (signed — credit or debit)
      const commission = Math.abs(toDecimal(pos.commission ?? 0, moneyDigits));
      const swap = toDecimal(pos.swap ?? 0, moneyDigits);
      const fees = commission + Math.abs(Math.min(swap, 0));

      const positionId = String(pos.positionId);

      // Fingerprint for open trades — keyed purely on positionId so it's stable
      // regardless of entry price updates (partial fills, etc.)
      const importFingerprint = `CTRADER_API_OPEN|${positionId}`;

      const draft: OpenTradeDraft = {
        importSource: "CTRADER",
        importSourceTradeId: positionId,
        importFingerprint,
        assetClass,
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice: null,
        fees,
        contractMultiplier: 1,
        openedAt,
        closedAt: null,
        status: "OPEN",
        netPnl: null,
        notes: tradeData.comment ?? null,
      };

      drafts.push(draft);
    } catch {
      // Skip positions that can't be mapped — non-fatal
    }
  }

  return drafts;
}
