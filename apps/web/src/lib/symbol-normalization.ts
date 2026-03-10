export function normalizeStoredTradeSymbol(symbol: string, assetClass: string) {
  const normalized = symbol.trim().toUpperCase();

  if (assetClass !== "CRYPTO") {
    return normalized;
  }

  return normalized
    .replace(/USDT$/g, "USD")
    .replace(/USDC$/g, "USD")
    .replace(/\/USDT$/g, "/USD")
    .replace(/\/USDC$/g, "/USD");
}
