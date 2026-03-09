import type { StatsCalendar } from "@/types";

import { formatDayLabel, formatMonthLabel, toDateKey, tradePnl } from "./serializers";
import type { StatsQuery, StatsTrade } from "./types";

function parseMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex - 1, 1));
}

function buildMonthGrid(anchor: Date) {
  const firstDay = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(firstDay.getUTCDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setUTCDate(gridStart.getUTCDate() + index);
    return day;
  });
}

export function buildCalendar(
  filters: StatsQuery,
  month: string,
  activityTrades: StatsTrade[],
  journalDates: Set<string>,
): StatsCalendar {
  const anchor = parseMonth(month);
  const monthMap = new Map<string, { pnl: number; tradeCount: number }>();

  for (const trade of activityTrades) {
    const key = toDateKey(new Date(trade.openedAt));
    const current = monthMap.get(key) ?? { pnl: 0, tradeCount: 0 };
    current.pnl += trade.status === "CLOSED" ? tradePnl(trade) : 0;
    current.tradeCount += 1;
    monthMap.set(key, current);
  }

  return {
    month,
    monthLabel: formatMonthLabel(anchor),
    days: buildMonthGrid(anchor).map((day) => {
      const key = toDateKey(day);
      const entry = monthMap.get(key);
      return {
        date: key,
        dayLabel: formatDayLabel(day),
        pnl: entry?.pnl ?? 0,
        tradeCount: entry?.tradeCount ?? 0,
        hasJournal: journalDates.has(key),
        inMonth: day.getUTCMonth() === anchor.getUTCMonth(),
      };
    }),
  };
}

export function calendarRange(month: string) {
  const anchor = parseMonth(month);
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
}
