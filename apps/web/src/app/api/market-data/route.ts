import { z } from "zod";

import { safeErrorResponse, withAuth } from "@/lib/api";
import {
  computeChartWindow,
  mapTradeSymbolCandidates,
  parseTwelveDataBars,
  resolveChartInterval,
  toTwelveDataDateTime,
} from "@/lib/market-data";

const querySchema = z.object({
  symbol: z.string().min(1).max(30).regex(/^[\w./\-:^ ]+$/, "Invalid symbol characters"),
  assetClass: z.string().max(20).optional().default(""),
  interval: z.string().max(10).nullable().optional(),
  openedAt: z.string().datetime({ offset: true, message: "openedAt must be an ISO date" }),
  closedAt: z.string().datetime({ offset: true, message: "closedAt must be an ISO date" }).nullable().optional(),
});

export const GET = withAuth(async (request) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return safeErrorResponse("TWELVE_DATA_API_KEY is not configured", 503);
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    symbol: searchParams.get("symbol"),
    assetClass: searchParams.get("assetClass") ?? undefined,
    interval: searchParams.get("interval"),
    openedAt: searchParams.get("openedAt"),
    closedAt: searchParams.get("closedAt"),
  });

  if (!parsed.success) {
    return safeErrorResponse("Invalid query parameters", 400);
  }

  const { symbol, assetClass, interval, openedAt, closedAt } = parsed.data;

  const providerSymbols = mapTradeSymbolCandidates(symbol, assetClass);
  const chartInterval = interval ?? null;
  const providerInterval = resolveChartInterval(chartInterval);
  const { start, end } = computeChartWindow(openedAt, closedAt ?? null, chartInterval);
  let lastError = "Unable to load market data";

  for (const providerSymbol of providerSymbols) {
    const upstreamUrl = new URL("https://api.twelvedata.com/time_series");
    upstreamUrl.searchParams.set("symbol", providerSymbol);
    upstreamUrl.searchParams.set("interval", providerInterval);
    upstreamUrl.searchParams.set("start_date", toTwelveDataDateTime(start, chartInterval));
    upstreamUrl.searchParams.set("end_date", toTwelveDataDateTime(end, chartInterval));
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
