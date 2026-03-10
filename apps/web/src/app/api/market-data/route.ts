import { safeErrorResponse, withAuth } from "@/lib/api";
import {
  computeChartWindow,
  mapTradeSymbolCandidates,
  parseTwelveDataBars,
  resolveChartInterval,
  toTwelveDataDateTime,
} from "@/lib/market-data";

export const GET = withAuth(async (request) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return safeErrorResponse("TWELVE_DATA_API_KEY is not configured", 503);
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const assetClass = searchParams.get("assetClass") ?? "";
  const interval = searchParams.get("interval");
  const openedAt = searchParams.get("openedAt");
  const closedAt = searchParams.get("closedAt");

  if (!symbol || !openedAt) {
    return safeErrorResponse("symbol and openedAt are required", 400);
  }

  const providerSymbols = mapTradeSymbolCandidates(symbol, assetClass);
  const providerInterval = resolveChartInterval(interval);
  const { start, end } = computeChartWindow(openedAt, closedAt, interval);
  let lastError = "Unable to load market data";

  for (const providerSymbol of providerSymbols) {
    const upstreamUrl = new URL("https://api.twelvedata.com/time_series");
    upstreamUrl.searchParams.set("symbol", providerSymbol);
    upstreamUrl.searchParams.set("interval", providerInterval);
    upstreamUrl.searchParams.set("start_date", toTwelveDataDateTime(start, interval));
    upstreamUrl.searchParams.set("end_date", toTwelveDataDateTime(end, interval));
    upstreamUrl.searchParams.set("timezone", "UTC");
    upstreamUrl.searchParams.set("order", "ASC");
    upstreamUrl.searchParams.set("outputsize", "1500");
    upstreamUrl.searchParams.set("apikey", apiKey);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    const payload = (await upstreamResponse.json()) as {
      status?: string;
      message?: string;
      meta?: {
        exchange_timezone?: string;
      };
      values?: Array<Record<string, string>>;
    };

    if (!upstreamResponse.ok || payload.status === "error") {
      lastError = payload.message ?? lastError;
      continue;
    }

    const bars = parseTwelveDataBars(payload.values);
    if (bars.length === 0) {
      lastError = "No market data available for this trade";
      continue;
    }

    return Response.json({
      symbol,
      providerSymbol,
      interval: providerInterval,
      timezone: payload.meta?.exchange_timezone ?? null,
      bars,
    });
  }

  return safeErrorResponse(lastError, 404);
});
