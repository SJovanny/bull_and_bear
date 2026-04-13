"use client";

import {
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatNumber, pnlColorClass } from "@/lib/format";
import type { EquityPoint } from "@/types";

type DailyPnlHistogramProps = {
  series: EquityPoint[];
};

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function histogramPalette(theme: ThemeMode) {
  if (theme === "dark") {
    return {
      background: "#1F2937",
      border: "#334155",
      text: "#94A3B8",
      grid: "rgba(148, 163, 184, 0.12)",
      positive: "#10B981",
      negative: "#EF4444",
      crosshair: "#3B82F6",
    };
  }

  return {
    background: "#F8FAFC",
    border: "#E2E8F0",
    text: "#475569",
    grid: "rgba(148, 163, 184, 0.16)",
    positive: "#10B981",
    negative: "#EF4444",
    crosshair: "#3B82F6",
  };
}

function formatTooltipValue(value: number) {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

export function DailyPnlHistogram({ series }: DailyPnlHistogramProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram", Time> | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);

  const palette = useMemo(() => histogramPalette(theme), [theme]);
  const chartData = useMemo<HistogramData<Time>[]>(() => {
    return series.map((point) => ({
      time: point.key as Time,
      value: point.pnl,
      color: point.pnl >= 0 ? palette.positive : palette.negative,
    }));
  }, [palette.negative, palette.positive, series]);
  const lookup = useMemo(() => new Map(series.map((point) => [point.key, point])), [series]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || series.length === 0) return;

    chartRef.current?.remove();

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: palette.background },
        textColor: palette.text,
      },
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: palette.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: palette.crosshair, width: 1, labelBackgroundColor: palette.crosshair },
        horzLine: { color: palette.crosshair, width: 1, labelBackgroundColor: palette.crosshair },
      },
      rightPriceScale: {
        borderColor: palette.border,
        scaleMargins: { top: 0.16, bottom: 0.16 },
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: palette.border,
        barSpacing: 18,
        minBarSpacing: 12,
        rightOffset: 0.5,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: false,
        secondsVisible: false,
        tickMarkFormatter: (time: Time) => {
          if (typeof time !== "string") {
            return "";
          }

          return time.slice(5).replace("-", "/");
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const histogramSeries = chart.addSeries(HistogramSeries, {
      base: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    histogramSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const data = param.seriesData.get(histogramSeries) as HistogramData<Time> | undefined;

      if (!data?.time || typeof data.time !== "string") {
        setHoveredPoint(null);
        return;
      }

      setHoveredPoint(lookup.get(data.time) ?? null);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    chartRef.current = chart;
    seriesRef.current = histogramSeries;

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartData, lookup, palette, series.length]);

  return (
    <div className="relative h-80 overflow-hidden rounded-lg border border-[#2e2e2e] bg-surface-2">
      {hoveredPoint ? (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-[#2e2e2e] bg-surface-1/95 px-3 py-2 text-xs shadow-none border border-[#2e2e2e] backdrop-blur-sm">
          <p className="font-semibold text-primary font-sans">{hoveredPoint.label}</p>
          <p className={`mt-1 font-mono ${pnlColorClass(hoveredPoint.pnl)}`}>{formatTooltipValue(hoveredPoint.pnl)}</p>
          <p className="mt-1 text-secondary font-mono">Trades: {hoveredPoint.tradeCount}</p>
        </div>
      ) : null}

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
