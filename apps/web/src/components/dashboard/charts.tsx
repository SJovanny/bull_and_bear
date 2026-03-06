"use client";

import { useMemo } from "react";
import { formatNumber } from "@/lib/format";
import type { DashboardPeriod } from "@/types";

type ChartsProps = {
  totalTrades: number;
  period: DashboardPeriod;
  totalNetPnl: number;
  equityCurve: number[];
  last14Days: { date: string; pnl: number }[];
  openTrades: number;
  closedTrades: number;
  accountsCount: number;
};

function sparklinePoints(values: number[], width = 420, height = 130) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function DashboardCharts({
  totalTrades,
  period,
  totalNetPnl,
  equityCurve,
  last14Days,
  openTrades,
  closedTrades,
  accountsCount,
}: ChartsProps) {
  const maxAbs14d = useMemo(() => {
    return Math.max(1, ...last14Days.map((day) => Math.abs(day.pnl)));
  }, [last14Days]);

  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <article className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Cumulative PnL</h2>
          <span className="text-xs text-secondary font-sans">{totalTrades} trades · {period}</span>
        </div>
        <svg viewBox="0 0 420 130" className="h-40 w-full rounded-lg bg-surface-2 p-2">
          <polyline
            points={sparklinePoints(equityCurve)}
            fill="none"
            stroke={totalNetPnl >= 0 ? "var(--color-pnl-positive)" : "var(--color-pnl-negative)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-xs text-secondary font-sans">
          Open/Closed: {openTrades}/{closedTrades} · Accounts: {accountsCount}
        </p>
      </article>

      <article className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Daily Net PnL (14d)</h2>
        </div>
        <div className="flex h-40 items-end gap-1 rounded-lg bg-surface-2 px-2 py-2">
          {last14Days.length === 0 ? (
            <p className="m-auto text-xs text-secondary font-sans">No data yet</p>
          ) : (
            last14Days.map((item) => {
              const height = Math.max(10, (Math.abs(item.pnl) / maxAbs14d) * 120);
              return (
                <div key={item.date} className="flex flex-1 flex-col items-center justify-end gap-1 group relative cursor-pointer">
                  <div className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-10 font-mono">
                    {item.date}: {formatNumber(item.pnl)}
                  </div>
                  <div
                    className={`w-full rounded-sm transition-opacity hover:opacity-80 ${item.pnl >= 0 ? "bg-pnl-positive" : "bg-pnl-negative"}`}
                    style={{ height: `${height}px` }}
                  />
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}