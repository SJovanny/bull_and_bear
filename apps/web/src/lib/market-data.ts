type SupportedAssetClass = "CRYPTO" | "FOREX" | "INDEX" | "STOCK" | "ETF" | "FUTURES" | string;

import { CRYPTO_QUOTES, INDEX_SYMBOL_ALIASES } from "./symbol-database";

export type MarketChartBar = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type MarketChartResponse = {
  symbol: string;
  providerSymbol: string;
  interval: string;
  timezone: string | null;
  bars: MarketChartBar[];
};

function cleanSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/\s+/g, "");
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function parseMarketTime(value: string) {
  if (value.includes(" ")) {
    return new Date(value.replace(" ", "T") + "Z").getTime();
  }

  return new Date(`${value}T00:00:00Z`).getTime();
}

export function mapTradeIntervalToTwelveData(interval: string | null) {
  switch (interval) {
    case "1m":
      return "1min";
    case "3m":
      return "1min";
    case "5m":
      return "5min";
    case "15m":
      return "15min";
    case "30m":
      return "30min";
    case "1h":
      return "1h";
    case "4h":
      return "4h";
    case "1D":
      return "1day";
    case "1W":
      return "1week";
    default:
      return "15min";
  }
}

export function resolveChartInterval(interval: string | null) {
  if (interval === "1D" || interval === "1W") {
    return mapTradeIntervalToTwelveData(interval);
  }

  return "1min";
}

function mapForexSymbol(symbol: string) {
  const normalized = cleanSymbol(symbol).replace(/[\/_-]/g, "");
  if (normalized.includes("/")) return normalized;
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}/${normalized.slice(3)}`;
  }
  return symbol;
}

function mapCryptoSymbol(symbol: string) {
  const normalized = cleanSymbol(symbol);
  if (normalized.includes("/")) return normalized;
  if (normalized.includes("-")) return normalized.replace("-", "/");

  const quote = CRYPTO_QUOTES.find((candidate) => normalized.endsWith(candidate));
  if (!quote) return symbol;

  const base = normalized.slice(0, normalized.length - quote.length);
  return `${base}/${quote}`;
}

function mapIndexSymbol(symbol: string) {
  const normalized = cleanSymbol(symbol).replace(/[\/_-]/g, "");
  return INDEX_SYMBOL_ALIASES[normalized]?.[0] ?? normalized;
}

export function mapTradeSymbolToTwelveData(symbol: string, assetClass: SupportedAssetClass) {
  switch (assetClass) {
    case "FOREX":
      return mapForexSymbol(symbol);
    case "CRYPTO":
      return mapCryptoSymbol(symbol);
    case "INDEX":
      return mapIndexSymbol(symbol);
    default:
      return cleanSymbol(symbol);
  }
}

export function mapTradeSymbolCandidates(symbol: string, assetClass: SupportedAssetClass) {
  const normalized = cleanSymbol(symbol);

  if (!normalized) {
    return [];
  }

  if (assetClass === "FOREX") {
    const compact = normalized.replace(/[\/_-]/g, "");
    if (compact.length === 6) {
      const base = compact.slice(0, 3);
      const quote = compact.slice(3);
      return unique([`${base}/${quote}`, compact]);
    }

    return unique([mapForexSymbol(symbol), normalized]);
  }

  if (assetClass === "CRYPTO") {
    const compact = normalized.replace(/[\/_-]/g, "");
    const quote = CRYPTO_QUOTES.find((candidate) => compact.endsWith(candidate));

    if (!quote) {
      return unique([mapCryptoSymbol(symbol), normalized]);
    }

    const base = compact.slice(0, compact.length - quote.length);
    return unique([`${base}/${quote}`, compact]);
  }

  if (assetClass === "INDEX" || assetClass === "CFD") {
    return unique(INDEX_SYMBOL_ALIASES[normalized] ?? [mapIndexSymbol(symbol), normalized]);
  }

  return unique([mapTradeSymbolToTwelveData(symbol, assetClass), normalized]);
}

export function computeChartWindow(openedAt: string, closedAt: string | null, interval: string | null) {
  const opened = new Date(openedAt);
  const closed = closedAt ? new Date(closedAt) : opened;
  const isHigherTimeframe = interval === "1D" || interval === "1W";

  if (!isHigherTimeframe) {
    const centeredWindowMs = 1_500 * 60_000;
    const minimumContextMs = 120 * 60_000;
    const span = Math.max(closed.getTime() - opened.getTime(), 0);
    const totalWindowMs = Math.max(centeredWindowMs, span + minimumContextMs * 2);
    const midpointMs = opened.getTime() + span / 2;

    return {
      start: new Date(midpointMs - totalWindowMs / 2),
      end: new Date(midpointMs + totalWindowMs / 2),
    };
  }

  const msPerBar = interval === "1W" ? 7 * 24 * 60 * 60_000 : 24 * 60 * 60_000;

  const span = Math.max(closed.getTime() - opened.getTime(), msPerBar * 24);
  const padding = Math.max(span * 2, msPerBar * 80);

  return {
    start: new Date(opened.getTime() - padding),
    end: new Date(closed.getTime() + padding),
  };
}

export function toTwelveDataDateTime(value: Date, interval: string | null) {
  if (interval === "1D" || interval === "1W" || interval === "1day" || interval === "1week") {
    return value.toISOString().slice(0, 10);
  }

  return value.toISOString().slice(0, 19).replace("T", " ");
}

export function parseTwelveDataBars(values: Array<Record<string, string>> | undefined): MarketChartBar[] {
  if (!Array.isArray(values)) return [];

  const bars: MarketChartBar[] = [];

  for (const value of values) {
    const open = Number(value.open);
    const high = Number(value.high);
    const low = Number(value.low);
    const close = Number(value.close);
    const volume = value.volume != null ? Number(value.volume) : undefined;

    if (![open, high, low, close].every(Number.isFinite) || !value.datetime) {
      continue;
    }

    bars.push({
      time: value.datetime,
      open,
      high,
      low,
      close,
      volume: volume != null && Number.isFinite(volume) ? volume : undefined,
    });
  }

  return bars.sort((left, right) => {
    return parseMarketTime(left.time) - parseMarketTime(right.time);
  });
}
