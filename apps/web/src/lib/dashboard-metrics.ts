import { toDateKey } from "./format";
import type { Trade } from "../types";

type ParsedTrade = Trade & {
  pnl: number;
  closedDate: Date;
};

export type CumulativePnlPoint = {
  date: string;
  label: string;
  pnl: number;
  cumulativePnl: number;
  cumulativePercent: number;
};

export function buildCumulativePnlSeries(trades: Trade[]): CumulativePnlPoint[] {
  const grouped = new Map<string, number>();

  trades
    .filter((trade): trade is ParsedTrade => {
      if (trade.status !== "CLOSED") {
        return false;
      }

      const closeValue = trade.closedAt ?? trade.openedAt;
      const closedDate = new Date(closeValue);
      if (Number.isNaN(closedDate.getTime())) {
        return false;
      }

      return true;
    })
    .map((trade) => {
      const closeValue = trade.closedAt ?? trade.openedAt;
      const closedDate = new Date(closeValue);

      return {
        ...trade,
        pnl: Number(trade.netPnl ?? 0),
        closedDate,
      } satisfies ParsedTrade;
    })
    .sort((a, b) => a.closedDate.getTime() - b.closedDate.getTime())
    .forEach((trade) => {
      const key = toDateKey(trade.closedDate);
      grouped.set(key, (grouped.get(key) ?? 0) + trade.pnl);
    });

  let cumulativePnl = 0;

  return [...grouped.entries()].map(([date, pnl]) => {
    cumulativePnl += pnl;
    return {
      date,
      label: formatChartDateLabel(date),
      pnl,
      cumulativePnl,
      cumulativePercent: cumulativePnl / 100,
    };
  });
}

function formatChartDateLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
}
