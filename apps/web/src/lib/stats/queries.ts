import { prisma } from "@/lib/prisma";

import type { ActivityDateField, StatsQuery, StatsTrade } from "./types";

function buildActivityWhere(filters: StatsQuery, dateField: ActivityDateField) {
  const rangeFilter =
    filters.from && filters.to
      ? {
          [dateField]: {
            gte: filters.from,
            lte: filters.to,
          },
        }
      : {};

  return {
    accountId: filters.accountId,
    userId: filters.userId,
    ...rangeFilter,
  };
}

function buildClosedWhere(filters: StatsQuery) {
  const rangeFilter =
    filters.from && filters.to
      ? {
          closedAt: {
            gte: filters.from,
            lte: filters.to,
          },
        }
      : {};

  return {
    accountId: filters.accountId,
    userId: filters.userId,
    status: "CLOSED" as const,
    ...rangeFilter,
  };
}

export async function fetchActivityTrades(filters: StatsQuery): Promise<StatsTrade[]> {
  return prisma.trade.findMany({
    where: buildActivityWhere(filters, "openedAt"),
    orderBy: { openedAt: "desc" },
    select: {
      id: true,
      symbol: true,
      assetClass: true,
      side: true,
      status: true,
      setupName: true,
      entryTimeframe: true,
      higherTimeframeBias: true,
      strategyTag: true,
      emotionalState: true,
      executionRating: true,
      planFollowed: true,
      openedAt: true,
      closedAt: true,
      netPnl: true,
      riskAmount: true,
    },
  });
}

export async function fetchClosedTrades(filters: StatsQuery): Promise<StatsTrade[]> {
  return prisma.trade.findMany({
    where: buildClosedWhere(filters),
    orderBy: { closedAt: "asc" },
    select: {
      id: true,
      symbol: true,
      assetClass: true,
      side: true,
      status: true,
      setupName: true,
      entryTimeframe: true,
      higherTimeframeBias: true,
      strategyTag: true,
      emotionalState: true,
      executionRating: true,
      planFollowed: true,
      openedAt: true,
      closedAt: true,
      netPnl: true,
      riskAmount: true,
    },
  });
}

export async function fetchRecentActivityTrades(filters: StatsQuery, take = 30) {
  return prisma.trade.findMany({
    where: buildActivityWhere(filters, "openedAt"),
    orderBy: { openedAt: "desc" },
    take,
  });
}

export async function fetchCalendarJournalDates(accountId: string, userId: string, start: Date, end: Date) {
  const rows = await prisma.dailyJournal.findMany({
    where: {
      accountId,
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    select: { date: true },
  });

  return new Set(rows.map((row) => row.date.toISOString().slice(0, 10)));
}
