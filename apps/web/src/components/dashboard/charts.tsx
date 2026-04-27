"use client";

import { useMemo, useState, useCallback } from "react";
import { formatNumber, pnlColorClass } from "@/lib/format";
import { DailyPnlHistogram } from "./daily-pnl-histogram";
import { useTranslation } from "@/lib/i18n/context";
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
  initialBalance: number | null;
};

function formatCurrency(value: number, fractionDigits = 2) {
  return `${value > 0 ? "+" : ""}${formatNumber(value, fractionDigits)}`;
}

// ─── Smooth cubic bezier path builder ────────────────────────────────────────

function buildSmoothPath(positions: { x: number; y: number }[]): string {
  if (positions.length === 0) return "";
  if (positions.length === 1) return `M ${positions[0].x},${positions[0].y}`;

  let d = `M ${positions[0].x},${positions[0].y}`;

  for (let i = 0; i < positions.length - 1; i++) {
    const p0 = positions[Math.max(0, i - 1)];
    const p1 = positions[i];
    const p2 = positions[i + 1];
    const p3 = positions[Math.min(positions.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

function buildAreaPath(positions: { x: number; y: number }[], zeroY: number): string {
  if (positions.length === 0) return "";
  const linePath = buildSmoothPath(positions);
  const lastX = positions[positions.length - 1].x;
  const firstX = positions[0].x;
  return `${linePath} L ${lastX},${zeroY} L ${firstX},${zeroY} Z`;
}

// ─── Nice tick calculation ───────────────────────────────────────────────────

function niceNum(val: number, round: boolean): number {
  const exp = Math.floor(Math.log10(val));
  const frac = val / Math.pow(10, exp);
  let nice: number;
  if (round) {
    nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return nice * Math.pow(10, exp);
}

function computeTicks(minVal: number, maxVal: number, targetCount = 5): number[] {
  if (maxVal === minVal) return [minVal];
  const range = niceNum(maxVal - minVal, false);
  const step = niceNum(range / (targetCount - 1), true);
  const start = Math.floor(minVal / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= maxVal + step * 0.5; t += step) {
    ticks.push(parseFloat(t.toFixed(10)));
  }
  return ticks;
}

// ─── Chart data builder ─────────────────────────────────────────────────────

type ChartData = {
  linePath: string;
  areaPath: string;
  min: number;
  max: number;
  ticks: number[];
  zeroY: number;
  pointPositions: { x: number; y: number; point: EquityPoint }[];
};

function buildLineChart(series: EquityPoint[], mode: "dollar" | "percent"): ChartData {
  if (series.length === 0) {
    return {
      linePath: "",
      areaPath: "",
      min: 0,
      max: 1,
      ticks: [0],
      zeroY: 100,
      pointPositions: [],
    };
  }

  const values = series.map((point) =>
    mode === "percent" && point.cumulativePercent !== null ? point.cumulativePercent : point.cumulativePnl,
  );
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  const spread = rawMax - rawMin;
  const padding = Math.max(spread * 0.15, 1);
  const min = rawMin - padding * 0.5;
  const max = rawMax + padding * 0.5;
  const range = max - min || 1;

  const ticks = computeTicks(min, max, 5);
  const tickMin = Math.min(...ticks, min);
  const tickMax = Math.max(...ticks, max);
  const fullRange = tickMax - tickMin || 1;

  const toY = (v: number) => 100 - ((v - tickMin) / fullRange) * 100;
  const zeroY = toY(0);

  const pointPositions = series.map((point, index) => {
    const val = mode === "percent" && point.cumulativePercent !== null ? point.cumulativePercent : point.cumulativePnl;
    const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
    const y = toY(val);
    return { x, y, point };
  });

  const linePath = buildSmoothPath(pointPositions);
  const areaPath = buildAreaPath(pointPositions, zeroY);

  return {
    linePath,
    areaPath,
    min: tickMin,
    max: tickMax,
    ticks,
    zeroY,
    pointPositions,
  };
}

function xLabelInterval(length: number) {
  if (length <= 7) return 1;
  return Math.ceil(length / 6);
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DashboardCharts({
  totalTrades,
  period,
  totalNetPnl,
  cumulativeSeries,
  last14Days,
  openTrades,
  closedTrades,
  accountsCount,
  initialBalance,
}: ChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hasBalance = initialBalance !== null && initialBalance > 0;
  const [equityMode, setEquityMode] = useState<"dollar" | "percent">("dollar");
  const activeMode = hasBalance ? equityMode : "dollar";
  const { t } = useTranslation();

  const chart = useMemo(() => buildLineChart(cumulativeSeries, activeMode), [cumulativeSeries, activeMode]);
  const hoveredPos = hoveredIndex !== null ? chart.pointPositions[hoveredIndex] ?? null : null;
  const latestPoint = cumulativeSeries[cumulativeSeries.length - 1] ?? null;
  const labelEvery = xLabelInterval(cumulativeSeries.length);

  const displayValue = activeMode === "percent" && latestPoint?.cumulativePercent !== null
    ? latestPoint?.cumulativePercent ?? 0
    : totalNetPnl;

  const isPositive = displayValue >= 0;
  const lineColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = isPositive ? "equity-grad-pos" : "equity-grad-neg";

  // Determine hovered point for the header display
  const headerPoint = hoveredPos ?? (chart.pointPositions.length > 0 ? chart.pointPositions[chart.pointPositions.length - 1] : null);
  const headerValue = headerPoint
    ? (activeMode === "percent" && headerPoint.point.cumulativePercent !== null
      ? headerPoint.point.cumulativePercent
      : headerPoint.point.cumulativePnl)
    : displayValue;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (chart.pointPositions.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      // Find closest point
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < chart.pointPositions.length; i++) {
        const dist = Math.abs(chart.pointPositions[i].x - xPct);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setHoveredIndex(closest);
    },
    [chart.pointPositions],
  );

  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);

  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
              {t("charts.cumulativePnl")}
            </h2>
            <p className="mt-1 text-xs text-secondary font-sans">
              {totalTrades} trades · {period}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary font-sans">
            {hasBalance ? (
              <span className="inline-flex overflow-hidden rounded-full border border-border bg-surface-2">
                <button
                  type="button"
                  onClick={() => setEquityMode("dollar")}
                  className={`px-2.5 py-1 transition ${activeMode === "dollar" ? "bg-brand-500 text-white" : "hover:bg-surface-1"}`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setEquityMode("percent")}
                  className={`px-2.5 py-1 transition ${activeMode === "percent" ? "bg-brand-500 text-white" : "hover:bg-surface-1"}`}
                >
                  %
                </button>
              </span>
            ) : null}
            <span className="rounded-full bg-surface-2 px-2.5 py-1">{t("charts.openClosed")} {openTrades}/{closedTrades}</span>
            <span className="rounded-full bg-surface-2 px-2.5 py-1">{t("charts.accounts")} {accountsCount}</span>
          </div>
        </div>

        {/* Chart area */}
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          {/* Value display */}
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lineColor, boxShadow: `0 0 0 4px ${lineColor}30` }}
              />
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-secondary font-sans">{t("charts.cumulative")}</span>
                <span className={`text-2xl font-black font-mono ${pnlColorClass(headerValue)}`}>
                  {activeMode === "percent"
                    ? `${formatCurrency(headerValue, 1)}%`
                    : formatCurrency(headerValue)}
                </span>
              </div>
            </div>

            {hoveredPos ? (
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-secondary font-sans">{hoveredPos.point.label}</span>
                  <span className={`text-lg font-bold font-mono ${pnlColorClass(hoveredPos.point.pnl)}`}>
                    {formatCurrency(hoveredPos.point.pnl)}
                  </span>
                  <span className="text-xs text-secondary font-mono">({hoveredPos.point.tradeCount} {t("charts.trades")})</span>
                </div>
              </div>
            ) : latestPoint ? (
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-secondary font-sans">{t("charts.latestSession")}</span>
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
              {t("charts.noClosedTrades")}
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
              {/* Y-axis labels */}
              <div className="relative h-64 w-12 pb-8 pt-1 text-right text-[11px] font-medium text-secondary font-mono sm:text-xs">
                {chart.ticks.map((tick, i) => (
                  <span
                    key={i}
                    className="absolute right-0 -translate-y-1/2 whitespace-nowrap"
                    style={{
                      top: `${((chart.max - tick) / (chart.max - chart.min || 1)) * (100 - 12.5)}%`,
                    }}
                  >
                    {activeMode === "percent" ? `${formatNumber(tick, 1)}%` : formatNumber(tick)}
                  </span>
                ))}
              </div>

              {/* Chart SVG */}
              <div
                className="relative h-64 cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Tooltip */}
                {hoveredPos ? (
                  <div
                    className="pointer-events-none absolute z-20 rounded-xl border border-border bg-surface-1/95 px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-sm transition-all duration-100"
                    style={{
                      left: `${hoveredPos.x}%`,
                      top: `calc(${Math.min(Math.max(hoveredPos.y - 12, 0), 60)}% - 0.5rem)`,
                      transform: hoveredPos.x > 75 ? "translateX(-100%)" : hoveredPos.x < 25 ? "translateX(0)" : "translateX(-50%)",
                    }}
                  >
                    <p className="font-semibold text-primary font-sans">{hoveredPos.point.label}</p>
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-secondary font-sans">
                        {t("charts.daily")}: <span className={`font-semibold ${pnlColorClass(hoveredPos.point.pnl)}`}>{formatCurrency(hoveredPos.point.pnl)}</span>
                      </p>
                      <p className="text-secondary font-sans">
                        {t("charts.cumulative")}: <span className={`font-semibold ${pnlColorClass(hoveredPos.point.cumulativePnl)}`}>{formatCurrency(hoveredPos.point.cumulativePnl)}</span>
                      </p>
                      {hoveredPos.point.cumulativePercent !== null ? (
                        <p className="text-secondary font-sans">
                          {t("charts.return")}: <span className={`font-semibold ${pnlColorClass(hoveredPos.point.cumulativePercent)}`}>{hoveredPos.point.cumulativePercent > 0 ? "+" : ""}{formatNumber(hoveredPos.point.cumulativePercent, 1)}%</span>
                        </p>
                      ) : null}
                      <p className="text-secondary font-mono">{t("charts.trades")}: {hoveredPos.point.tradeCount}</p>
                    </div>
                  </div>
                ) : null}

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-[calc(100%-2rem)] w-full overflow-visible">
                  <defs>
                    {/* Gradient fill */}
                    <linearGradient id="equity-grad-pos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="equity-grad-neg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
                    </linearGradient>
                    {/* Glow filter for the line */}
                    <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  {chart.ticks.map((tick, i) => {
                    const y = 100 - ((tick - chart.min) / ((chart.max - chart.min) || 1)) * 100;
                    return (
                      <line
                        key={i}
                        x1="0" y1={y} x2="100" y2={y}
                        stroke="rgba(100, 116, 139, 0.12)"
                        strokeWidth="0.3"
                      />
                    );
                  })}

                  {/* Zero line (prominent) */}
                  {chart.min < 0 && chart.max > 0 && (
                    <line
                      x1="0" y1={chart.zeroY} x2="100" y2={chart.zeroY}
                      stroke="rgba(148, 163, 184, 0.35)"
                      strokeWidth="0.4"
                      strokeDasharray="2 1.5"
                    />
                  )}

                  {/* Gradient area fill */}
                  <path
                    d={chart.areaPath}
                    fill={`url(#${gradientId})`}
                    className="animate-[fadeIn_0.6s_ease-out]"
                  />

                  {/* Smooth line with glow */}
                  <path
                    d={chart.linePath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#line-glow)"
                    vectorEffect="non-scaling-stroke"
                    className="animate-[drawLine_1s_ease-out]"
                  />

                  {/* Hover crosshair */}
                  {hoveredPos ? (
                    <line
                      x1={hoveredPos.x} y1="0"
                      x2={hoveredPos.x} y2="100"
                      stroke="rgba(148, 163, 184, 0.3)"
                      strokeWidth="0.3"
                      strokeDasharray="1 1"
                    />
                  ) : null}

                  {/* Data points */}
                  {chart.pointPositions.map(({ x, y, point }, i) => {
                    const isHovered = hoveredIndex === i;
                    return (
                      <g key={point.key}>
                        {isHovered ? (
                          <>
                            <circle cx={x} cy={y} r="3" fill={`${lineColor}20`} />
                            <circle cx={x} cy={y} r="2" fill="var(--color-surface-1)" stroke={lineColor} strokeWidth="0.8" />
                            <circle cx={x} cy={y} r="0.8" fill={lineColor} />
                          </>
                        ) : (
                          <circle cx={x} cy={y} r="0.9" fill="var(--color-surface-1)" stroke={lineColor} strokeWidth="0.5" opacity="0.7" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute inset-x-0 bottom-0 flex h-8 items-end justify-between gap-2 text-[11px] font-medium text-secondary font-mono sm:text-xs">
                  {cumulativeSeries.map((point, index) => {
                    const shouldShow =
                      index === 0 ||
                      index === cumulativeSeries.length - 1 ||
                      index % labelEvery === 0;

                    return (
                      <span
                        key={point.key}
                        className={`min-w-0 flex-1 text-center transition-opacity ${shouldShow ? "opacity-100" : "opacity-0"}`}
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
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("charts.dailyPnl14d")}</h2>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-3">
          {last14Days.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-secondary font-sans">{t("charts.noData")}</div>
          ) : (
            <DailyPnlHistogram series={last14Days} />
          )}
        </div>
        <p className={`mt-2 text-xs font-medium font-sans ${pnlColorClass(totalNetPnl)}`}>
          {t("charts.runningNet")}: {totalNetPnl > 0 ? "+" : ""}{formatNumber(totalNetPnl)}
        </p>
      </article>
    </section>
  );
}
