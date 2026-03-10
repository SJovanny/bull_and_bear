import type { BreakdownKey, DashboardPeriod, DistributionMetric } from "@/types";

import type { ResolvedStatsFilters, StatsQuery } from "./types";

const PERIODS = new Set<DashboardPeriod>(["7D", "30D", "YTD", "ALL"]);
const BREAKDOWN_KEYS = new Set<BreakdownKey>([
  "symbol",
  "setupName",
  "strategyTag",
  "assetClass",
  "side",
  "entryTimeframe",
  "higherTimeframeBias",
  "planFollowed",
  "emotionalState",
  "executionRating",
]);
const DISTRIBUTION_METRICS = new Set<DistributionMetric>(["pnl", "rMultiple", "holdingTime"]);
const GROUP_BY_VALUES = new Set(["day", "week", "month"] as const);

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

export function resolveStatsPeriod(searchParams: URLSearchParams, userId: string): StatsQuery {
  const accountId = searchParams.get("accountId")?.trim() ?? "";
  if (!accountId) {
    throw new Error("accountId is required");
  }

  const rawPeriod = (searchParams.get("period")?.toUpperCase() ?? "30D") as DashboardPeriod;
  const period = PERIODS.has(rawPeriod) ? rawPeriod : "30D";

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const now = new Date();

  let from: Date | null = null;
  let to: Date | null = null;

  if (fromParam || toParam) {
    if (!fromParam || !toParam) {
      throw new Error("from and to must be provided together");
    }

    const parsedFrom = startOfUtcDay(new Date(fromParam));
    const parsedTo = endOfUtcDay(new Date(toParam));

    if (!isValidDate(parsedFrom) || !isValidDate(parsedTo)) {
      throw new Error("Invalid date range");
    }

    if (parsedFrom > parsedTo) {
      throw new Error("from must be before to");
    }

    from = parsedFrom;
    to = parsedTo;
  } else if (period !== "ALL") {
    to = endOfUtcDay(now);

    if (period === "7D") {
      from = startOfUtcDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    } else if (period === "30D") {
      from = startOfUtcDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
    } else {
      from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    }
  }

  return { accountId, userId, period, from, to };
}

export function resolveBreakdownKey(searchParams: URLSearchParams): BreakdownKey {
  const value = (searchParams.get("by")?.trim() ?? "symbol") as BreakdownKey;
  return BREAKDOWN_KEYS.has(value) ? value : "symbol";
}

export function resolveDistributionMetric(searchParams: URLSearchParams): DistributionMetric {
  const value = (searchParams.get("metric")?.trim() ?? "pnl") as DistributionMetric;
  return DISTRIBUTION_METRICS.has(value) ? value : "pnl";
}

export function resolveGroupBy(searchParams: URLSearchParams): "day" | "week" | "month" {
  const value = (searchParams.get("groupBy")?.trim() ?? "day") as "day" | "week" | "month";
  return GROUP_BY_VALUES.has(value) ? value : "day";
}

export function resolveMonth(searchParams: URLSearchParams) {
  const month = searchParams.get("month")?.trim();
  if (!month) {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("month must use YYYY-MM format");
  }

  return month;
}

export function withBreakdownFilters(searchParams: URLSearchParams, userId: string): ResolvedStatsFilters {
  return {
    ...resolveStatsPeriod(searchParams, userId),
    breakdownBy: resolveBreakdownKey(searchParams),
  };
}

export function withDistributionFilters(searchParams: URLSearchParams, userId: string): ResolvedStatsFilters {
  return {
    ...resolveStatsPeriod(searchParams, userId),
    distributionMetric: resolveDistributionMetric(searchParams),
  };
}

export function withEquityFilters(searchParams: URLSearchParams, userId: string): ResolvedStatsFilters {
  return {
    ...resolveStatsPeriod(searchParams, userId),
    groupBy: resolveGroupBy(searchParams),
  };
}

export function withCalendarFilters(searchParams: URLSearchParams, userId: string): ResolvedStatsFilters {
  return {
    ...resolveStatsPeriod(searchParams, userId),
    month: resolveMonth(searchParams),
  };
}
