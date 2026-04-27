import type { AssetClass, TradeSide } from "@prisma/client";
import { read, utils } from "xlsx";

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
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
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

  if (timezoneOffset) {
    return `${isoLike}${timezoneOffset}`;
  }

  return isoLike;
}

function parseDdMmDate(value: string, timezoneOffset?: string | null): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/);
  if (!match) return null;
  const [, day, month, year, time] = match;
  return new Date(withTimezoneSuffix(`${year}-${month}-${day}T${time}`, timezoneOffset));
}

function parseDottedDate(value: string, timezoneOffset?: string | null): Date | null {
  const match = value.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/);
  if (!match) return null;
  const [, year, month, day, time] = match;
  return new Date(withTimezoneSuffix(`${year}-${month}-${day}T${time}`, timezoneOffset));
}

function parseDate(value: string, fieldName: string, timezoneOffset?: string | null) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  const ddMm = parseDdMmDate(trimmed, timezoneOffset);
  if (ddMm && !Number.isNaN(ddMm.getTime())) return ddMm;

  const dotted = parseDottedDate(trimmed, timezoneOffset);
  if (dotted && !Number.isNaN(dotted.getTime())) return dotted;

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

function isCTraderHeaders(headers: string[]) {
  const normalized = headers.map((h) => normalizeHeader(String(h ?? "")));
  const hasDirection = normalized.includes("opening direction") || normalized.includes("sens d'ouverture");
  const hasClosingPrice = normalized.includes("closing price") || normalized.includes("price de cloture") || normalized.includes("cours de cloture");
  return hasDirection && hasClosingPrice;
}

function detectSource(fileContent: string, fileName?: string): TradeImportSource | null {
  if (fileName?.toLowerCase().endsWith(".xlsx")) {
    try {
      const workbook = read(fileContent, { type: "base64" });
      const firstSheet = workbook.SheetNames[0] ? workbook.Sheets[workbook.SheetNames[0]] : null;
      if (firstSheet) {
        const rows = utils.sheet_to_json<(string | number | null)[]>(firstSheet, { header: 1, raw: false, defval: "" });
        const headerRow = (rows[0] ?? []).map((c) => String(c ?? ""));
        if (isCTraderHeaders(headerRow)) {
          return "CTRADER";
        }
      }
    } catch {
      // fall through
    }
    return "METATRADER";
  }

  const snippet = fileContent.slice(0, 2000).toLowerCase();
  if ((snippet.includes("opening direction") || snippet.includes("sens d'ouverture")) &&
      (snippet.includes("closing price") || snippet.includes("price de cloture") || snippet.includes("cours de cloture"))) {
    return "CTRADER";
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
    if (header === "id" || header === "id de l'ordre") map.id = index;
    if (header === "symbol" || header === "symbole") map.symbol = index;
    if (header === "opening direction" || header === "sens d'ouverture") map.openingDirection = index;
    if (header === "opening time" || header.startsWith("opening time (") || header === "heure d'ouverture" || header.startsWith("heure d'ouverture (")) {
      map.openingTime = index;
      map.openingTimezoneOffset = extractTimezoneOffsetFromHeader(cell);
    }
    if (header === "closing time" || header.startsWith("closing time (") || header === "heure de cloture" || header.startsWith("heure de cloture (")) {
      map.closingTime = index;
      map.closingTimezoneOffset = extractTimezoneOffsetFromHeader(cell);
    }
    if (header === "entry price" || header === "cours d'entree" || header === "price d'entree") map.entryPrice = index;
    if (header === "closing price" || header === "price de cloture" || header === "cours de cloture") map.closingPrice = index;
    if (header === "closing quantity" || header === "quantite de cloture") map.quantity = index;
    if (header === "commissions") map.commissions = index;
    if (header === "swap" || header === "echange") map.swap = index;
    if (header.startsWith("net ") || header.startsWith("net\u00a0") || header.endsWith(" nets") || header.endsWith("\u00a0nets")) map.net = index;
    if (header === "comment" || header === "commentaire") map.comment = index;
  });
  return map;
}

function readCell(cells: string[], index: number | undefined) {
  return index == null ? "" : (cells[index] ?? "").trim();
}

/**
 * Strips leading characters that could trigger formula injection in
 * spreadsheet applications (=, +, -, @, tab, carriage-return).
 * Only use on text fields (symbol, notes), NOT on numeric values.
 */
function sanitizeTextCell(value: string): string {
  let v = value;
  while (v.length > 0 && /^[=+\-@\t\r]/.test(v)) {
    v = v.slice(1).trimStart();
  }
  return v;
}

function parseCTraderDirection(value: string): "LONG" | "SHORT" | null {
  const direction = value.toLowerCase();
  if (direction === "buy" || direction === "acheter") return "LONG";
  if (direction === "sell" || direction === "vendre") return "SHORT";
  return null;
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
      const symbol = sanitizeTextCell(readCell(cells, headerMap.symbol));
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
      const notes = sanitizeTextCell(readCell(cells, headerMap.comment)) || null;
      const side = parseCTraderDirection(direction);

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

function parseCTraderXlsx(fileContent: string): TradeImportPreview {
  let workbook;

  try {
    workbook = read(fileContent, { type: "base64" });
  } catch {
    return { detectedSource: "CTRADER", rows: [], errors: [{ rowNumber: 1, message: "Could not read XLSX file" }] };
  }

  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;

  if (!firstSheet) {
    return { detectedSource: "CTRADER", rows: [], errors: [{ rowNumber: 1, message: "Workbook is empty" }] };
  }

  const sheetRows = utils.sheet_to_json<(string | number | null)[]>(firstSheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
  const rowsAsText = sheetRows.map((row) => row.map(normalizeWorksheetCell));

  if (rowsAsText.length < 2) {
    return { detectedSource: "CTRADER", rows: [], errors: [{ rowNumber: 1, message: "File is empty" }] };
  }

  const headerMap = buildCTraderHeaderMap(rowsAsText[0] ?? []);
  const rows: TradeImportPreviewRow[] = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];
  const seenSourceIds = new Set<string>();
  const seenFingerprints = new Set<string>();

  for (let index = 1; index < rowsAsText.length; index += 1) {
    const cells = rowsAsText[index] ?? [];
    const rowNumber = index + 1;

    if (!cells.some(Boolean)) {
      continue;
    }

    try {
      const symbol = sanitizeTextCell(readCell(cells, headerMap.symbol));
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
      const notes = sanitizeTextCell(readCell(cells, headerMap.comment)) || null;
      const side = parseCTraderDirection(direction);

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

type MetaTraderXlsxHeaderMap = {
  ticket?: number;
  symbol?: number;
  type?: number;
  size?: number;
  openTime?: number;
  closeTime?: number;
  openPrice?: number;
  closePrice?: number;
  commission?: number;
  swap?: number;
  profit?: number;
  comment?: number;
};

function normalizeWorksheetCell(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function isMetaTraderSectionLabel(value: string) {
  const header = normalizeHeader(value);
  return header === "positions" || header === "ordres" || header === "orders" || header === "transactions" || header === "resultats" || header === "results";
}

function buildMetaTraderXlsxHeaderMap(headerCells: string[]): MetaTraderXlsxHeaderMap {
  const map: MetaTraderXlsxHeaderMap = {};

  headerCells.forEach((cell, index) => {
    const header = normalizeHeader(cell);

    if (header === "position" || header === "ticket") map.ticket = index;
    if (header === "symbole" || header === "symbol") map.symbol = index;
    if (header === "type") map.type = index;
    if (header === "volume" || header === "size" || header === "lots") map.size = index;
    if ((header === "heure" || header === "time") && map.openTime == null) {
      map.openTime = index;
      return;
    }
    if (header === "heure" || header === "time") {
      map.closeTime = index;
      return;
    }
    if ((header === "prix" || header === "price" || header === "open price") && map.openPrice == null) {
      map.openPrice = index;
      return;
    }
    if (header === "prix" || header === "price" || header === "close price") {
      map.closePrice = index;
      return;
    }
    if (header === "commission") map.commission = index;
    if (header === "echange" || header === "swap") map.swap = index;
    if (header === "profit") map.profit = index;
    if (header === "commentaire" || header === "comment") map.comment = index;
  });

  return map;
}

function normalizeMetaTraderXlsxTradeType(value: string) {
  return normalizeHeader(value)
    .replace(/^achat$/, "buy")
    .replace(/^vente$/, "sell");
}

function parseMetaTraderXlsx(fileContent: string): TradeImportPreview {
  let workbook;

  try {
    workbook = read(fileContent, { type: "base64" });
  } catch {
    return { detectedSource: "METATRADER", rows: [], errors: [{ rowNumber: 1, message: "Could not read XLSX file" }] };
  }

  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;

  if (!firstSheet) {
    return { detectedSource: "METATRADER", rows: [], errors: [{ rowNumber: 1, message: "Workbook is empty" }] };
  }

  const sheetRows = utils.sheet_to_json<(string | number | null)[]>(firstSheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
  const rowsAsText = sheetRows.map((row) => row.map(normalizeWorksheetCell));
  const positionsLabelIndex = rowsAsText.findIndex((cells) => normalizeHeader(cells[0] ?? "") === "positions");

  if (positionsLabelIndex === -1) {
    return { detectedSource: "METATRADER", rows: [], errors: [{ rowNumber: 1, message: "Could not find positions section" }] };
  }

  const headerRowIndex = positionsLabelIndex + 1;
  const headerCells = rowsAsText[headerRowIndex] ?? [];
  const headerMap = buildMetaTraderXlsxHeaderMap(headerCells);
  const rows: TradeImportPreviewRow[] = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];
  const seenSourceIds = new Set<string>();
  const seenFingerprints = new Set<string>();

  for (let index = headerRowIndex + 1; index < rowsAsText.length; index += 1) {
    const cells = rowsAsText[index] ?? [];
    const rowNumber = index + 1;
    const firstCell = readCell(cells, 0);

    if (!cells.some(Boolean)) {
      continue;
    }

    if (isMetaTraderSectionLabel(firstCell)) {
      break;
    }

    try {
      const typeValue = normalizeMetaTraderXlsxTradeType(readCell(cells, headerMap.type));

      if (!typeValue || typeValue.includes("balance") || typeValue.includes("credit") || typeValue.includes("deposit")) {
        continue;
      }

      const isBuy = typeValue.includes("buy");
      const isSell = typeValue.includes("sell");

      if (!isBuy && !isSell) {
        continue;
      }

      const closeValue = readCell(cells, headerMap.closeTime);
      if (!closeValue) {
        continue;
      }

      const sourceTradeId = readCell(cells, headerMap.ticket) || null;
      const draft = toImportedTradeDraft({
        source: "METATRADER",
        sourceTradeId,
        symbol: sanitizeTextCell(readCell(cells, headerMap.symbol)),
        side: isBuy ? "LONG" : "SHORT",
        quantity: parseNumber(readCell(cells, headerMap.size), "size"),
        entryPrice: parseNumber(readCell(cells, headerMap.openPrice), "open price"),
        exitPrice: parseNumber(readCell(cells, headerMap.closePrice), "close price"),
        fees:
          Math.abs(parseSignedNumber(readCell(cells, headerMap.commission) || "0", "commission")) +
          Math.abs(parseSignedNumber(readCell(cells, headerMap.swap) || "0", "swap")),
        openedAt: parseDate(readCell(cells, headerMap.openTime), "open time"),
        closedAt: parseDate(closeValue, "close time"),
        notes: sanitizeTextCell(readCell(cells, headerMap.comment)) || null,
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

export function parseImportedTrades(fileContent: string, selectedSource: TradeImportSource, fileName?: string): TradeImportPreview {
  const detectedSource = detectSource(fileContent, fileName);

  if (selectedSource === "CTRADER") {
    const isXlsx = fileName?.toLowerCase().endsWith(".xlsx");
    const preview = isXlsx ? parseCTraderXlsx(fileContent) : parseCTraderCsv(fileContent);
    return { ...preview, detectedSource };
  }

  if (!fileName?.toLowerCase().endsWith(".xlsx")) {
    return {
      detectedSource,
      rows: [],
      errors: [{ rowNumber: 1, message: "MetaTrader imports require an XLSX file" }],
    };
  }

  const preview = parseMetaTraderXlsx(fileContent);
  return { ...preview, detectedSource };
}
