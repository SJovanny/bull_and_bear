export const FOREX_CURRENCIES = new Set([
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CNH",
  "CNY",
  "COP",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "ILS",
  "INR",
  "JPY",
  "KRW",
  "MXN",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RUB",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "USD",
  "ZAR",
]);

export const CRYPTO_BASES = new Set([
  "AAVE",
  "ADA",
  "ALGO",
  "APE",
  "APT",
  "ARB",
  "ATOM",
  "AVAX",
  "BNB",
  "BTC",
  "DOG",
  "DOGE",
  "DOT",
  "EOS",
  "ETH",
  "FIL",
  "FTM",
  "HBAR",
  "ICP",
  "LINK",
  "LTC",
  "MANA",
  "MATIC",
  "NEAR",
  "OP",
  "POL",
  "SAND",
  "SHIB",
  "SOL",
  "SUI",
  "TRX",
  "UNI",
  "VET",
  "XLM",
  "XRP",
]);

export const CRYPTO_QUOTES = ["USD", "USDT", "USDC", "BTC", "ETH", "EUR"] as const;

export const COMMODITY_SYMBOLS = new Set([
  "XAUUSD",
  "XAGUSD",
  "XPTUSD",
  "XPDUSD",
  "XTIUSD",
  "XBRUSD",
  "XCUUSD",
  "XNGUSD",
  "USOIL",
  "UKOIL",
  "BRENT",
  "WTI",
  "NATGAS",
  "GOLD",
  "SILVER",
  "PLATINUM",
  "PALLADIUM",
  "COPPER",
]);

export const FUTURES_MULTIPLIERS: Record<string, number> = {
  CL: 1000,
  CT: 500,
  ES: 50,
  FDXM: 5,
  FDAX: 25,
  FESX: 10,
  GC: 100,
  GF: 500,
  HE: 400,
  HG: 25000,
  KC: 375,
  LE: 400,
  M2K: 5,
  MBT: 0.1,
  MCL: 100,
  MES: 5,
  MET: 0.1,
  MGC: 10,
  MNQ: 2,
  MYM: 0.5,
  NG: 10000,
  NKD: 5,
  NQ: 20,
  PA: 100,
  PL: 50,
  RTY: 50,
  SB: 1120,
  SI: 5000,
  ZB: 1000,
  ZC: 50,
  ZF: 1000,
  ZL: 600,
  ZM: 100,
  ZN: 1000,
  ZS: 50,
  ZT: 2000,
  ZW: 50,
  YM: 5,
};

export const INDEX_SYMBOLS = new Set([
  "AUS200",
  "CAC40",
  "CHINA50",
  "CN50",
  "DAX",
  "DJI",
  "EU50",
  "EUSTX50",
  "FRA40",
  "FTSE100",
  "GER40",
  "HK50",
  "IBEX35",
  "IT40",
  "JP225",
  "NAS100",
  "NDX",
  "NIKKEI225",
  "RUT",
  "SPA35",
  "SP500",
  "SPX",
  "SPX500",
  "SUI20",
  "UK100",
  "US30",
  "US500",
  "USTEC",
  "VIX",
]);

export const INDEX_SYMBOL_ALIASES: Record<string, string[]> = {
  CAC40: ["FCHI"],
  DAX: ["GDAXI", "DAX"],
  DJI: ["DJI"],
  FRA40: ["FCHI"],
  FTSE100: ["FTSE"],
  GER40: ["GDAXI", "DAX"],
  JP225: ["N225"],
  NAS100: ["IXIC", "NDX"],
  NDX: ["NDX", "IXIC"],
  NIKKEI225: ["N225"],
  RUT: ["RUT"],
  SP500: ["SPX", "GSPC"],
  SPX: ["SPX", "GSPC"],
  UK100: ["FTSE"],
  US30: ["DJI"],
  US500: ["SPX", "GSPC"],
  USTEC: ["IXIC", "NDX"],
  VIX: ["VIX"],
  XAGUSD: ["XAG/USD"],
  XAUUSD: ["XAU/USD"],
};

export const SYMBOL_SUGGESTIONS = {
  CFD: ["XAUUSD", "XAGUSD", "US500", "NAS100", "USOIL"],
  CRYPTO: ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD", "DOGEUSD"],
  ETF: ["SPY", "QQQ", "IWM", "DIA", "XLF"],
  FOREX: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"],
  FUTURES: ["NQ", "MNQ", "ES", "MES", "CL", "GC", "MGC"],
  INDEX: ["US500", "NAS100", "US30", "GER40", "UK100", "JP225"],
  OPTIONS: ["AAPL 200C", "TSLA 180P", "SPY 500C", "QQQ 430P"],
  OTHER: ["CUSTOM1", "CUSTOM2"],
  STOCK: ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"],
} as const;

function normalizeSymbol(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function stripBrokerSymbolDecorators(symbol: string) {
  let normalized = normalizeSymbol(symbol)
    .replace(/^#/, "")
    .replace(/[._-](?:MICRO|MINI|CASH|SPOT|PRO|RAW|STD|ECN)$/g, "")
    .replace(/[._-](?:A|B|C|I|M|P|R)$/g, "")
    .replace(/\.(?:A|B|C|I|M|P|R)$/g, "")
    .replace(/(?:MICRO|MINI)$/g, "");

  if (/^[A-Z]{6,7}M$/.test(normalized)) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function extractCompactSymbol(symbol: string) {
  return stripBrokerSymbolDecorators(symbol).replace(/[\/_-]/g, "");
}

export function extractCryptoBase(symbol: string) {
  const compact = extractCompactSymbol(symbol);
  const quote = CRYPTO_QUOTES.find((candidate) => compact.endsWith(candidate));
  if (!quote) {
    return null;
  }

  const base = compact.slice(0, compact.length - quote.length);
  return base || null;
}

export function isKnownForexPair(symbol: string) {
  const compact = extractCompactSymbol(symbol);

  if (!/^[A-Z]{6}$/.test(compact)) {
    return false;
  }

  const base = compact.slice(0, 3);
  const quote = compact.slice(3);
  return FOREX_CURRENCIES.has(base) && FOREX_CURRENCIES.has(quote);
}

export function normalizeFuturesRoot(symbol: string) {
  const compact = extractCompactSymbol(symbol);
  const exactMatch = FUTURES_MULTIPLIERS[compact];
  if (exactMatch != null) {
    return compact;
  }

  const withoutNumericSuffix = compact.replace(/\d+$/g, "");
  if (FUTURES_MULTIPLIERS[withoutNumericSuffix] != null) {
    return withoutNumericSuffix;
  }

  const monthCodeMatch = compact.match(/^([A-Z]{1,4})([FGHJKMNQUVXZ])(\d{1,4})$/);
  if (monthCodeMatch && FUTURES_MULTIPLIERS[monthCodeMatch[1]] != null) {
    return monthCodeMatch[1];
  }

  return withoutNumericSuffix;
}

export function isCommoditySymbol(symbol: string) {
  const compact = extractCompactSymbol(symbol);
  return COMMODITY_SYMBOLS.has(compact);
}

export function isCryptoSymbol(symbol: string) {
  const base = extractCryptoBase(symbol);
  return base != null && CRYPTO_BASES.has(base);
}

export function isFuturesSymbol(symbol: string) {
  const root = normalizeFuturesRoot(symbol);
  return FUTURES_MULTIPLIERS[root] != null;
}

export function isIndexSymbol(symbol: string) {
  const compact = extractCompactSymbol(symbol);
  return INDEX_SYMBOLS.has(compact);
}
