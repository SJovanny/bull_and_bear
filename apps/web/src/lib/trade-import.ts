import type { AssetClass, TradeSide } from "@prisma/client";

import {
  extractCompactSymbol,
  isCommoditySymbol,
  isCryptoSymbol,
  isFuturesSymbol,
  isIndexSymbol,
  isKnownForexPair,
} from "./symbol-database";
import { normalizeStoredTradeSymbol } from "./symbol-normalization";
import { computeNetPnl, defaultContractMultiplier } from "./trade-calc";

export type TradeImportSource = "CTRADER" | "METATRADER";

export type ImportedTradeDraft = {
  importSource: TradeImportSource;
  importSourceTradeId: string | null;
  importFingerprint: string;
  assetClass: AssetClass;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  contractMultiplier: number;
  openedAt: Date;
  closedAt: Date;
  status: "CLOSED";
  netPnl: number;
  notes: string | null;
};

export type TradeImportPreviewRow = ImportedTradeDraft & {
  rowNumber: number;
  duplicateReason: "source_trade_id" | "fingerprint" | "same_file" | null;
};

export type TradeImportPreview = {
  detectedSource: TradeImportSource | null;
  rows: TradeImportPreviewRow[];
  errors: Array<{ rowNumber: number; message: string }>;
};

export type PersistableImportedTrade = Omit<TradeImportPreviewRow, "rowNumber" | "duplicateReason">;

type CTraderHeaderMap = {
  id?: number;
  symbol?: number;
  openingDirection?: number;
  openingTime?: number;
  openingTimezoneOffset?: string | null;
  closingTime?: number;
  closingTimezoneOffset?: string | null;
  entryPrice?: number;
  closingPrice?: number;
  quantity?: number;
  commissions?: number;
  swap?: number;
  net?: number;
  comment?: number;
};

type MetaTraderHeaderMap = {
  ticket?: number;
  symbol?: number;
  type?: number;
  openTime?: number;
  closeTime?: number;
  size?: number;
  openPrice?: number;
  closePrice?: number;
  commission?: number;
  swap?: number;
  profit?: number;
  comment?: number;
};

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseNumber(value: string, fieldName: string) {
  const normalized = value.trim().replace(/\s+/g, "").replace(/,/g, "").replace(/[€$£¥₹₿]+/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return parsed;
}

function parseSignedNumber(value: string, fieldName: string) {
  const normalized = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/[€$£¥₹₿]+/g, "")
    .replace(/^\((.*)\)$/g, "-$1");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return parsed;
}

function normalizeUtcOffset(offset: string) {
  const match = offset.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) {
    return null;
  }

  const [, sign, hours, minutes] = match;
  return `${sign}${hours.padStart(2, "0")}:${(minutes ?? "00").padStart(2, "0")}`;
}

function withTimezoneSuffix(isoLike: string, timezoneOffset?: string | null) {
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(isoLike)) {
    return isoLike;
  }

  return `${isoLike}${timezoneOffset ?? "Z"}`;
}

function parseDdMmDate(value: string, timezoneOffset?: string | null): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/);
  if (!match) return null;
  const [, day, month, year, time] = match;
  return new Date(withTimezoneSuffix(`${year}-${month}-${day}T${time}`, timezoneOffset));
}

function parseDate(value: string, fieldName: string, timezoneOffset?: string | null) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  const ddMm = parseDdMmDate(trimmed, timezoneOffset);
  if (ddMm && !Number.isNaN(ddMm.getTime())) return ddMm;

  const normalized = withTimezoneSuffix(trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T"), timezoneOffset);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return parsed;
}

function inferAssetClass(symbol: string): AssetClass {
  if (isCommoditySymbol(symbol)) {
    return "CFD";
  }

  if (isCryptoSymbol(symbol)) {
    return "CRYPTO";
  }

  if (isKnownForexPair(symbol)) {
    return "FOREX";
  }

  if (isFuturesSymbol(symbol)) {
    return "FUTURES";
  }

  if (isIndexSymbol(symbol)) {
    return "INDEX";
  }

  const compact = extractCompactSymbol(symbol);
  if (/^[A-Z]{1,5}$/.test(compact)) {
    return "CFD";
  }

  return "CFD";
}

function extractTimezoneOffsetFromHeader(header: string) {
  const match = header.match(/\((UTC[+-]\d{1,2}(?::?\d{2})?)\)/i);
  return match ? normalizeUtcOffset(match[1]) : null;
}

function normalizeTradeType(value: string) {
  return value.trim().toLowerCase();
}

function detectSource(fileContent: string): TradeImportSource | null {
  const snippet = fileContent.slice(0, 2000).toLowerCase();
  if (snippet.includes("opening direction") && snippet.includes("closing price")) {
    return "CTRADER";
  }
  if (snippet.includes("ticket") && snippet.includes("open time") && snippet.includes("close time")) {
    return "METATRADER";
  }
  if (snippet.includes("<table") && snippet.includes("ticket") && snippet.includes("profit")) {
    return "METATRADER";
  }
  return null;
}

function buildFingerprint(params: {
  source: TradeImportSource;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  openedAt: Date;
  closedAt: Date;
}) {
  return [
    params.source,
    params.symbol,
    params.side,
    params.quantity.toFixed(6),
    params.entryPrice.toFixed(6),
    params.exitPrice.toFixed(6),
    params.openedAt.toISOString(),
    params.closedAt.toISOString(),
  ].join("|");
}

function toImportedTradeDraft(params: {
  source: TradeImportSource;
  sourceTradeId: string | null;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  openedAt: Date;
  closedAt: Date;
  notes: string | null;
  netPnl?: number | null;
}) {
  const assetClass = inferAssetClass(params.symbol);
  const normalizedSymbol = normalizeStoredTradeSymbol(params.symbol, assetClass);
  const contractMultiplier = defaultContractMultiplier(assetClass, normalizedSymbol);
  const computedNetPnl = computeNetPnl({
    side: params.side,
    entryPrice: params.entryPrice,
    exitPrice: params.exitPrice,
    quantity: params.quantity,
    fees: params.fees,
    contractMultiplier,
  });
  const fingerprint = buildFingerprint({
    source: params.source,
    symbol: normalizedSymbol,
    side: params.side,
    quantity: params.quantity,
    entryPrice: params.entryPrice,
    exitPrice: params.exitPrice,
    openedAt: params.openedAt,
    closedAt: params.closedAt,
  });

  return {
    importSource: params.source,
    importSourceTradeId: params.sourceTradeId,
    importFingerprint: fingerprint,
    assetClass,
    symbol: normalizedSymbol,
    side: params.side,
    quantity: params.quantity,
    entryPrice: params.entryPrice,
    exitPrice: params.exitPrice,
    fees: params.fees,
    contractMultiplier,
    openedAt: params.openedAt,
    closedAt: params.closedAt,
    status: "CLOSED" as const,
    netPnl: params.netPnl != null ? params.netPnl : computedNetPnl,
    notes: params.notes,
  };
}

function buildCTraderHeaderMap(headerCells: string[]): CTraderHeaderMap {
  const map: CTraderHeaderMap = {};
  headerCells.forEach((cell, index) => {
    const header = normalizeHeader(cell);
    if (header === "id") map.id = index;
    if (header === "symbol") map.symbol = index;
    if (header === "opening direction") map.openingDirection = index;
    if (header === "opening time" || header.startsWith("opening time (")) {
      map.openingTime = index;
      map.openingTimezoneOffset = extractTimezoneOffsetFromHeader(cell);
    }
    if (header === "closing time" || header.startsWith("closing time (")) {
      map.closingTime = index;
      map.closingTimezoneOffset = extractTimezoneOffsetFromHeader(cell);
    }
    if (header === "entry price") map.entryPrice = index;
    if (header === "closing price") map.closingPrice = index;
    if (header === "closing quantity") map.quantity = index;
    if (header === "commissions") map.commissions = index;
    if (header === "swap") map.swap = index;
    if (header.startsWith("net ") || header.startsWith("net\u00a0")) map.net = index;
    if (header === "comment") map.comment = index;
  });
  return map;
}

function buildMetaTraderHeaderMap(headerCells: string[]): MetaTraderHeaderMap {
  const map: MetaTraderHeaderMap = {};
  headerCells.forEach((cell, index) => {
    const header = normalizeHeader(cell);
    if (header === "ticket" || header === "order") map.ticket = index;
    if (header === "symbol") map.symbol = index;
    if (header === "type") map.type = index;
    if (header === "open time" || header === "time") map.openTime = index;
    if (header === "close time") map.closeTime = index;
    if (header === "size" || header === "lots") map.size = index;
    if (header === "price" || header === "open price") map.openPrice = index;
    if (header === "close price") map.closePrice = index;
    if (header === "commission") map.commission = index;
    if (header === "swap") map.swap = index;
    if (header === "profit") map.profit = index;
    if (header === "comment") map.comment = index;
  });
  return map;
}

function readCell(cells: string[], index: number | undefined) {
  return index == null ? "" : (cells[index] ?? "").trim();
}

function parseCTraderCsv(fileContent: string): TradeImportPreview {
  const lines = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { detectedSource: "CTRADER", rows: [], errors: [{ rowNumber: 1, message: "File is empty" }] };
  }

  const headerMap = buildCTraderHeaderMap(splitCsvLine(lines[0]));
  const rows: TradeImportPreviewRow[] = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];
  const seenSourceIds = new Set<string>();
  const seenFingerprints = new Set<string>();

  for (let index = 1; index < lines.length; index += 1) {
    const rowNumber = index + 1;

    try {
      const cells = splitCsvLine(lines[index]);
      const symbol = readCell(cells, headerMap.symbol);
      const direction = readCell(cells, headerMap.openingDirection).toLowerCase();
      const closedAt = parseDate(readCell(cells, headerMap.closingTime), "closing time", headerMap.closingTimezoneOffset);
      const openingTimeRaw = readCell(cells, headerMap.openingTime);
      const openedAt = openingTimeRaw
        ? parseDate(openingTimeRaw, "opening time", headerMap.openingTimezoneOffset ?? headerMap.closingTimezoneOffset)
        : closedAt;
      const quantityRaw = readCell(cells, headerMap.quantity).replace(/\s*lots$/i, "");
      const quantity = parseNumber(quantityRaw, "quantity");
      const entryPrice = parseNumber(readCell(cells, headerMap.entryPrice), "entry price");
      const exitPrice = parseNumber(readCell(cells, headerMap.closingPrice), "closing price");
      const commissions = parseSignedNumber(readCell(cells, headerMap.commissions) || "0", "commissions");
      const swap = parseSignedNumber(readCell(cells, headerMap.swap) || "0", "swap");
      const sourceTradeId = readCell(cells, headerMap.id) || null;
      const notes = readCell(cells, headerMap.comment) || null;
      const side = direction === "buy" ? "LONG" : direction === "sell" ? "SHORT" : null;

      if (!side) {
        throw new Error("Unsupported opening direction");
      }

      const draft = toImportedTradeDraft({
        source: "CTRADER",
        sourceTradeId,
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice,
        fees: Math.abs(commissions) + Math.abs(swap),
        openedAt,
        closedAt,
        notes,
        netPnl: readCell(cells, headerMap.net) ? parseSignedNumber(readCell(cells, headerMap.net), "net pnl") : null,
      });

      let duplicateReason: TradeImportPreviewRow["duplicateReason"] = null;

      if (sourceTradeId && seenSourceIds.has(sourceTradeId)) {
        duplicateReason = "same_file";
      }
      if (!duplicateReason && seenFingerprints.has(draft.importFingerprint)) {
        duplicateReason = "same_file";
      }

      if (sourceTradeId) seenSourceIds.add(sourceTradeId);
      seenFingerprints.add(draft.importFingerprint);

      rows.push({ rowNumber, duplicateReason, ...draft });
    } catch (error) {
      errors.push({
        rowNumber,
        message: error instanceof Error ? error.message : "Could not parse row",
      });
    }
  }

  return { detectedSource: "CTRADER", rows, errors };
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHtmlRows(fileContent: string) {
  const rowMatches = [...fileContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  return rowMatches.map((match) => match[1]);
}

function extractHtmlCells(rowContent: string) {
  const cellMatches = [...rowContent.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
  return cellMatches.map((match) => stripHtml(match[1]));
}

function parseMetaTraderHtml(fileContent: string): TradeImportPreview {
  const htmlRows = extractHtmlRows(fileContent);
  const tableRows = htmlRows.map(extractHtmlCells).filter((cells) => cells.length > 0);
  const headerRowIndex = tableRows.findIndex((cells) => cells.some((cell) => normalizeHeader(cell) === "ticket" || normalizeHeader(cell) === "order"));

  if (headerRowIndex === -1) {
    return { detectedSource: "METATRADER", rows: [], errors: [{ rowNumber: 1, message: "Could not find trade table" }] };
  }

  const headerMap = buildMetaTraderHeaderMap(tableRows[headerRowIndex]);
  const rows: TradeImportPreviewRow[] = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];
  const seenSourceIds = new Set<string>();
  const seenFingerprints = new Set<string>();

  for (let index = headerRowIndex + 1; index < tableRows.length; index += 1) {
    const cells = tableRows[index];
    const rowNumber = index + 1;
    const typeValue = normalizeTradeType(readCell(cells, headerMap.type));

    if (!typeValue || typeValue.includes("balance") || typeValue.includes("credit") || typeValue.includes("deposit")) {
      continue;
    }

    try {
      const isBuy = typeValue.includes("buy");
      const isSell = typeValue.includes("sell");
      if (!isBuy && !isSell) {
        continue;
      }

      const openedAt = parseDate(readCell(cells, headerMap.openTime), "open time");
      const closeValue = readCell(cells, headerMap.closeTime);
      if (!closeValue) {
        continue;
      }
      const closedAt = parseDate(closeValue, "close time");
      const sourceTradeId = readCell(cells, headerMap.ticket) || null;
      const draft = toImportedTradeDraft({
        source: "METATRADER",
        sourceTradeId,
        symbol: readCell(cells, headerMap.symbol),
        side: isBuy ? "LONG" : "SHORT",
        quantity: parseNumber(readCell(cells, headerMap.size), "size"),
        entryPrice: parseNumber(readCell(cells, headerMap.openPrice), "open price"),
        exitPrice: parseNumber(readCell(cells, headerMap.closePrice), "close price"),
        fees:
          Math.abs(parseSignedNumber(readCell(cells, headerMap.commission) || "0", "commission")) +
          Math.abs(parseSignedNumber(readCell(cells, headerMap.swap) || "0", "swap")),
        openedAt,
        closedAt,
        notes: readCell(cells, headerMap.comment) || null,
        netPnl: readCell(cells, headerMap.profit) ? parseSignedNumber(readCell(cells, headerMap.profit), "profit") : null,
      });

      let duplicateReason: TradeImportPreviewRow["duplicateReason"] = null;
      if (sourceTradeId && seenSourceIds.has(sourceTradeId)) {
        duplicateReason = "same_file";
      }
      if (!duplicateReason && seenFingerprints.has(draft.importFingerprint)) {
        duplicateReason = "same_file";
      }

      if (sourceTradeId) seenSourceIds.add(sourceTradeId);
      seenFingerprints.add(draft.importFingerprint);

      rows.push({ rowNumber, duplicateReason, ...draft });
    } catch (error) {
      errors.push({
        rowNumber,
        message: error instanceof Error ? error.message : "Could not parse row",
      });
    }
  }

  return { detectedSource: "METATRADER", rows, errors };
}

export function parseImportedTrades(fileContent: string, selectedSource: TradeImportSource): TradeImportPreview {
  const detectedSource = detectSource(fileContent);

  if (selectedSource === "CTRADER") {
    const preview = parseCTraderCsv(fileContent);
    return { ...preview, detectedSource };
  }

  const preview = parseMetaTraderHtml(fileContent);
  return { ...preview, detectedSource };
}
