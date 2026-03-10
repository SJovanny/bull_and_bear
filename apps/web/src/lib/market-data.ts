type SupportedAssetClass = "CRYPTO" | "FOREX" | "INDEX" | "STOCK" | "ETF" | "FUTURES" | string;

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

  const knownQuotes = ["USD", "BTC", "ETH", "EUR"];
  const quote = knownQuotes.find((candidate) => normalized.endsWith(candidate));
  if (!quote) return symbol;

  const base = normalized.slice(0, normalized.length - quote.length);
  return `${base}/${quote}`;
}

function mapIndexSymbol(symbol: string) {
  const normalized = cleanSymbol(symbol).replace(/[\/_-]/g, "");
  const aliases: Record<string, string> = {
    SPX: "SPX",
    SP500: "SPX",
    US500: "SPX",
    NAS100: "IXIC",
    NDX: "NDX",
    US30: "DJI",
    DJI: "DJI",
    DAX: "GDAXI",
    GER40: "GDAXI",
    UK100: "FTSE",
    FTSE100: "FTSE",
    CAC40: "FCHI",
    FRA40: "FCHI",
    JP225: "N225",
    NIKKEI225: "N225",
  };

  return aliases[normalized] ?? normalized;
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
    const quotes = ["USD", "BTC", "ETH", "EUR"];
    const quote = quotes.find((candidate) => compact.endsWith(candidate));

    if (!quote) {
      return unique([mapCryptoSymbol(symbol), normalized]);
    }

    const base = compact.slice(0, compact.length - quote.length);
    return unique([`${base}/${quote}`, compact]);
  }

  if (assetClass === "INDEX" || assetClass === "CFD") {
    const aliases: Record<string, string[]> = {
      SPX: ["SPX", "GSPC"],
      SP500: ["SPX", "GSPC"],
      US500: ["SPX", "GSPC"],
      NAS100: ["IXIC", "NDX"],
      USTEC: ["IXIC", "NDX"],
      NDX: ["NDX", "IXIC"],
      US30: ["DJI"],
      DJI: ["DJI"],
      GER40: ["GDAXI", "DAX"],
      DAX: ["GDAXI", "DAX"],
      UK100: ["FTSE"],
      FTSE100: ["FTSE"],
      CAC40: ["FCHI"],
      FRA40: ["FCHI"],
      VIX: ["VIX"],
      RUT: ["RUT"],
      XAUUSD: ["XAU/USD"],
      XAGUSD: ["XAG/USD"],
    };

    return unique(aliases[normalized] ?? [mapIndexSymbol(symbol), normalized]);
  }

  return unique([mapTradeSymbolToTwelveData(symbol, assetClass), normalized]);
}

export function computeChartWindow(openedAt: string, closedAt: string | null, interval: string | null) {
  const opened = new Date(openedAt);
  const closed = closedAt ? new Date(closedAt) : opened;

  const msPerBar = (() => {
    switch (interval) {
      case "1m":
        return 60_000;
      case "3m":
        return 3 * 60_000;
      case "5m":
        return 5 * 60_000;
      case "15m":
        return 15 * 60_000;
      case "30m":
        return 30 * 60_000;
      case "1h":
        return 60 * 60_000;
      case "4h":
        return 4 * 60 * 60_000;
      case "1D":
        return 24 * 60 * 60_000;
      case "1W":
        return 7 * 24 * 60 * 60_000;
      default:
        return 15 * 60_000;
    }
  })();

  const span = Math.max(closed.getTime() - opened.getTime(), msPerBar * 24);
  const padding = Math.max(span * 2, msPerBar * 80);

  return {
    start: new Date(opened.getTime() - padding),
    end: new Date(closed.getTime() + padding),
  };
}

export function toTwelveDataDateTime(value: Date, interval: string | null) {
  if (interval === "1D" || interval === "1W") {
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
