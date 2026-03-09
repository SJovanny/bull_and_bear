"use client";

import { useMemo, useState } from "react";
import { formatNumber, pnlColorClass } from "@/lib/format";
import type { DashboardPeriod, EquityPoint } from "@/types";

type ChartsProps = {
  totalTrades: number;
  period: DashboardPeriod;
  totalNetPnl: number;
  cumulativeSeries: EquityPoint[];
  last14Days: EquityPoint[];
  openTrades: number;
  closedTrades: number;
  accountsCount: number;
};

function formatCurrency(value: number, fractionDigits = 2) {
  return `${value > 0 ? "+" : ""}${formatNumber(value, fractionDigits)}`;
}

function buildLineChart(series: EquityPoint[]) {
  if (series.length === 0) {
    return {
      points: "",
      min: 0,
      max: 1,
      ticks: [0, 0.33, 0.66, 1],
      pointPositions: [] as { x: number; y: number; point: EquityPoint }[],
    };
  }

  const values = series.map((point) => point.cumulativePnl);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = maxValue - minValue;
  const padding = Math.max(spread * 0.2, Math.max(Math.abs(maxValue), Math.abs(minValue), 1) * 0.08);
  const min = Math.min(0, minValue - padding * 0.35, maxValue === minValue ? minValue - 1 : minValue - padding * 0.35);
  const max = maxValue + padding;
  const range = max - min || 1;

  const pointPositions = series.map((point, index) => {
    const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
    const y = 100 - ((point.cumulativePnl - min) / range) * 100;
    return { x, y, point };
  });

  return {
    points: pointPositions.map(({ x, y }) => `${x},${y}`).join(" "),
    min,
    max,
    ticks: Array.from({ length: 4 }, (_, index) => max - (index * (max - min)) / 3),
    pointPositions,
  };
}

function xLabelInterval(length: number) {
  if (length <= 7) {
    return 1;
  }

  return Math.ceil(length / 6);
}

export function DashboardCharts({
  totalTrades,
  period,
  totalNetPnl,
  cumulativeSeries,
  last14Days,
  openTrades,
  closedTrades,
  accountsCount,
}: ChartsProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const maxAbs14d = useMemo(() => {
    return Math.max(1, ...last14Days.map((day) => Math.abs(day.pnl)));
  }, [last14Days]);

  const chart = useMemo(() => buildLineChart(cumulativeSeries), [cumulativeSeries]);
  const hoveredPoint = chart.pointPositions.find(({ point }) => point.key === hoveredDate) ?? null;
  const latestPoint = cumulativeSeries[cumulativeSeries.length - 1] ?? null;
  const labelEvery = xLabelInterval(cumulativeSeries.length);
  const lineColor = totalNetPnl >= 0 ? "var(--color-pnl-positive)" : "var(--color-pnl-negative)";
  const lineGlow = totalNetPnl >= 0 ? "rgba(16, 185, 129, 0.18)" : "rgba(239, 68, 68, 0.18)";

  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              Cumulative PnL
            </h2>
            <p className="mt-1 text-xs text-secondary font-sans">
              {totalTrades} trades · {period}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary font-sans">
            <span className="rounded-full bg-surface-2 px-2.5 py-1">Open/Closed {openTrades}/{closedTrades}</span>
            <span className="rounded-full bg-surface-2 px-2.5 py-1">Accounts {accountsCount}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lineColor, boxShadow: `0 0 0 4px ${lineGlow}` }}
              />
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-secondary font-sans">Cumulative</span>
                <span className={`text-2xl font-black font-mono ${pnlColorClass(latestPoint?.cumulativePnl ?? totalNetPnl)}`}>
                  {formatCurrency(latestPoint?.cumulativePnl ?? totalNetPnl)}
                </span>
              </div>
            </div>

            {latestPoint ? (
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-secondary font-sans">Latest session</span>
                  <span className={`text-xl font-black font-mono ${pnlColorClass(latestPoint.pnl)}`}>
                    {formatCurrency(latestPoint.pnl)}
                  </span>
                  <span className="text-sm text-secondary font-mono">{latestPoint.label}</span>
                </div>
              </div>
            ) : null}
          </div>

          {cumulativeSeries.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface-1 px-4 text-sm text-secondary font-sans">
              No closed trades yet
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
              <div className="flex h-64 flex-col justify-between pb-8 pt-1 text-right text-[11px] font-medium text-secondary font-mono sm:text-xs">
                {chart.ticks.map((tick) => (
                  <span key={tick}>{formatNumber(tick)}</span>
                ))}
              </div>

              <div className="relative h-64">
                {hoveredPoint ? (
                  <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-border bg-surface-1 px-3 py-2 text-xs shadow-md"
                    style={{
                      left: `${hoveredPoint.x}%`,
                      top: `calc(${Math.max(hoveredPoint.y - 16, 0)}% - 0.5rem)`,
                    }}
                  >
                     <p className="font-semibold text-primary font-sans">{hoveredPoint.point.label}</p>
                     <p className="mt-1 text-secondary font-sans">
                       Daily: <span className={pnlColorClass(hoveredPoint.point.pnl)}>{formatCurrency(hoveredPoint.point.pnl)}</span>
                     </p>
                     <p className="text-secondary font-sans">
                       Cumulative: <span className={pnlColorClass(hoveredPoint.point.cumulativePnl)}>{formatCurrency(hoveredPoint.point.cumulativePnl)}</span>
                     </p>
                     <p className="text-secondary font-mono">
                       Net: {hoveredPoint.point.cumulativePnl > 0 ? "+" : ""}{formatNumber(hoveredPoint.point.cumulativePnl)}
                     </p>
                     <p className="text-secondary font-mono">Trades: {hoveredPoint.point.tradeCount}</p>
                   </div>
                 ) : null}

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-[calc(100%-2rem)] w-full overflow-visible">
                  {chart.ticks.map((tick) => {
                    const y = 100 - ((tick - chart.min) / ((chart.max - chart.min) || 1)) * 100;

                    return (
                      <line
                        key={tick}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        stroke="rgba(100, 116, 139, 0.18)"
                        strokeWidth="0.45"
                      />
                    );
                  })}

                  <polyline
                    points={chart.points}
                    fill="none"
                    stroke={lineGlow}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={chart.points}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="1.45"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chart.pointPositions.map(({ x, y, point }) => (
                    <g key={point.key}>
                      {hoveredDate === point.key ? (
                        <>
                          <line
                            x1={x}
                            y1="0"
                            x2={x}
                            y2="100"
                            stroke="rgba(59, 130, 246, 0.28)"
                            strokeWidth="0.35"
                            strokeDasharray="1.2 1.4"
                          />
                          <circle cx={x} cy={y} r="2.25" fill="rgba(59, 130, 246, 0.12)" />
                        </>
                      ) : null}
                      <circle cx={x} cy={y} r="1.2" fill="var(--color-surface-1)" stroke={lineColor} strokeWidth="0.7" />
                      <circle cx={x} cy={y} r="0.3" fill={lineColor} />
                    </g>
                  ))}
                </svg>

                <div className="absolute inset-0 bottom-8">
                  {chart.pointPositions.map(({ x, point }) => (
                    <button
                      key={point.key}
                      type="button"
                      aria-label={`Show PnL data for ${point.label}`}
                      className="absolute top-0 h-full w-8 -translate-x-1/2 bg-transparent outline-none"
                      style={{ left: `${x}%` }}
                      onMouseEnter={() => setHoveredDate(point.key)}
                      onMouseLeave={() => setHoveredDate((current) => (current === point.key ? null : current))}
                      onFocus={() => setHoveredDate(point.key)}
                      onBlur={() => setHoveredDate((current) => (current === point.key ? null : current))}
                    >
                      <span className="sr-only">{point.label}</span>
                    </button>
                  ))}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex h-8 items-end justify-between gap-2 text-[11px] font-medium text-secondary font-mono sm:text-xs">
                  {cumulativeSeries.map((point, index) => {
                    const shouldShow =
                      index === 0 ||
                      index === cumulativeSeries.length - 1 ||
                      index % labelEvery === 0;

                    return (
                      <span
                        key={point.key}
                        className={`min-w-0 flex-1 text-center ${shouldShow ? "opacity-100" : "opacity-0"}`}
                      >
                        {point.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
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
                <div key={item.key} className="flex flex-1 flex-col items-center justify-end gap-1 group relative cursor-pointer">
                  <div className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-10 font-mono">
                    {item.label}: {formatNumber(item.pnl)}
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
        <p className={`mt-2 text-xs font-medium font-sans ${pnlColorClass(totalNetPnl)}`}>
          Running net: {totalNetPnl > 0 ? "+" : ""}{formatNumber(totalNetPnl)}
        </p>
      </article>
    </section>
  );
}
