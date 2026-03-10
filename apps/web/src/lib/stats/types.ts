import type { BreakdownKey, DistributionMetric, StatsPeriod } from "@/types";

export type StatsQuery = {
  accountId: string;
  userId: string;
  period: StatsPeriod;
  from: Date | null;
  to: Date | null;
};

export type ActivityDateField = "openedAt" | "closedAt";

export type StatsTrade = {
  id: string;
  symbol: string;
  assetClass: string;
  side: "LONG" | "SHORT";
  status: string;
  setupName: string | null;
  entryTimeframe: string | null;
  higherTimeframeBias: string | null;
  strategyTag: string | null;
  emotionalState: string | null;
  executionRating: number | null;
  planFollowed: boolean | null;
  openedAt: Date;
  closedAt: Date | null;
  netPnl: unknown;
  riskAmount: unknown;
};

export type ResolvedStatsFilters = StatsQuery & {
  breakdownBy?: BreakdownKey;
  distributionMetric?: DistributionMetric;
  groupBy?: "day" | "week" | "month";
  month?: string;
};
