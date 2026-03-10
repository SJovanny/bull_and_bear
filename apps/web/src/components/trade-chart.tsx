"use client";

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createSeriesMarkers,
  createChart,
  type CandlestickData,
  type IChartApi,
  type IPrimitivePaneRenderer,
  type IPrimitivePaneView,
  type ISeriesApi,
  type ISeriesPrimitive,
  type SeriesAttachedParameter,
  type SeriesMarker,
  type SeriesType,
  type Time,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

type TradeChartProps = {
  symbol: string;
  assetClass: string;
  interval: string | null;
  side: "LONG" | "SHORT";
  openedAt: string;
  closedAt: string | null;
  entryPrice: string;
  initialStopLoss: string | null;
  initialTakeProfit: string | null;
  exitPrice: string | null;
};

type ThemeMode = "light" | "dark";

type MarketDataResponse = {
  symbol: string;
  providerSymbol: string;
  interval: string;
  timezone: string | null;
  bars: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
};

type ChartBar = CandlestickData<Time>;
type TrendPoint = { time: Time; price: number };

function getInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function parseLevel(value: string | null) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value: number | null) {
  if (value == null) return "-";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

/**
 * Returns the local timezone offset in milliseconds for a given UTC timestamp.
 * Positive when local time is ahead of UTC (e.g. +3_600_000 for UTC+1 Paris).
 * Uses the timestamp-specific offset to handle DST transitions correctly.
 */
function localOffsetMs(utcMs: number): number {
  return -new Date(utcMs).getTimezoneOffset() * 60_000;
}

function toChartTime(value: string): Time {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value as Time;
  }

  // Parse bar time as UTC, then shift by local offset so the chart axis shows local time.
  const utcMs = new Date(value.replace(" ", "T") + "Z").getTime();
  return Math.floor((utcMs + localOffsetMs(utcMs)) / 1000) as Time;
}

function timeToMillis(value: Time) {
  if (typeof value === "string") {
    return new Date(`${value}T00:00:00Z`).getTime();
  }

  return Number(value) * 1000;
}

/**
 * Parse a trade ISO timestamp and shift it by the local timezone offset so it
 * lives in the same "local-shifted" reference frame as the chart bar times.
 */
function parseTradeTimestamp(value: string) {
  const utcMs = new Date(value).getTime();
  if (Number.isNaN(utcMs)) return null;
  return utcMs + localOffsetMs(utcMs);
}

function intervalToMs(interval: string | null) {
  switch (interval) {
    case "1m":
      return 60_000;
    case "3m":
      return 3 * 60_000;
    case "5m":
      return 5 * 60_000;
    case "15m":
      return 15 * 60_000;
    case "30m":
      return 30 * 60_000;
    case "1h":
      return 60 * 60_000;
    case "4h":
      return 4 * 60 * 60_000;
    case "1D":
      return 24 * 60 * 60_000;
    case "1W":
      return 7 * 24 * 60 * 60_000;
    default:
      return 15 * 60_000;
  }
}

/**
 * Snap a trade timestamp to the start of its candle bucket.
 * All math is done in local-shifted time so the result can be compared directly
 * against chart bar times produced by toChartTime().
 */
function bucketTradeTime(targetIso: string, interval: string | null) {
  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  if (interval === "1D") {
    return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  }

  if (interval === "1W") {
    const day = target.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate() - diff);
  }

  // Shift UTC → local, then floor to the bucket boundary.
  const utcMs = target.getTime();
  const localMs = utcMs + localOffsetMs(utcMs);
  const bucket = intervalToMs(interval);
  return Math.floor(localMs / bucket) * bucket;
}

function resolveTradeBarTime(bars: ChartBar[], targetIso: string, interval: string | null) {
  if (bars.length === 0) {
    return undefined;
  }

  const targetTime = parseTradeTimestamp(targetIso);
  const bucketedTime = bucketTradeTime(targetIso, interval);
  if (targetTime == null || bucketedTime == null) {
    return bars[bars.length - 1]?.time;
  }

  const exactMatch = bars.find((bar) => timeToMillis(bar.time) === bucketedTime);
  if (exactMatch) {
    return exactMatch.time;
  }

  const bucketSize = intervalToMs(interval);
  for (const bar of bars) {
    const barTime = timeToMillis(bar.time);
    if (barTime <= targetTime && targetTime < barTime + bucketSize) {
      return bar.time;
    }
  }

  let nearestBar = bars[0];
  let nearestDistance = Math.abs(timeToMillis(nearestBar.time) - bucketedTime);

  for (const bar of bars.slice(1)) {
    const distance = Math.abs(timeToMillis(bar.time) - bucketedTime);
    if (distance < nearestDistance) {
      nearestBar = bar;
      nearestDistance = distance;
    }
  }

  return nearestBar.time;
}

function findBarIndex(bars: ChartBar[], time: Time | undefined) {
  if (!time) {
    return -1;
  }

  return bars.findIndex((bar) => bar.time === time);
}

class TradePathRenderer implements IPrimitivePaneRenderer {
  constructor(
    private chart: IChartApi,
    private series: ISeriesApi<SeriesType, Time>,
    private from: TrendPoint,
    private to: TrendPoint,
    private color: string,
  ) {}

  draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]): void {
    target.useMediaCoordinateSpace(({ context }) => {
      const x1 = this.chart.timeScale().timeToCoordinate(this.from.time);
      const y1 = this.series.priceToCoordinate(this.from.price);
      const x2 = this.chart.timeScale().timeToCoordinate(this.to.time);
      const y2 = this.series.priceToCoordinate(this.to.price);

      if (x1 == null || y1 == null || x2 == null || y2 == null) {
        return;
      }

      context.save();
      context.beginPath();
      context.setLineDash([6, 4]);
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineWidth = 2;
      context.strokeStyle = this.color;
      context.stroke();
      context.restore();
    });
  }
}

class TradePathPaneView implements IPrimitivePaneView {
  constructor(private rendererInstance: IPrimitivePaneRenderer) {}

  zOrder() {
    return "top" as const;
  }

  renderer() {
    return this.rendererInstance;
  }
}

class TradePathPrimitive implements ISeriesPrimitive<Time> {
  private chart: IChartApi | null = null;
  private series: ISeriesApi<SeriesType, Time> | null = null;

  constructor(
    private from: TrendPoint,
    private to: TrendPoint,
    private color: string,
  ) {}

  attached(param: SeriesAttachedParameter<Time, SeriesType>) {
    this.chart = param.chart as IChartApi;
    this.series = param.series;
  }

  detached() {
    this.chart = null;
    this.series = null;
  }

  paneViews() {
    if (!this.chart || !this.series) {
      return [];
    }

    return [
      new TradePathPaneView(new TradePathRenderer(this.chart, this.series, this.from, this.to, this.color)),
    ];
  }
}

function buildTradeMarker(
  id: string,
  time: Time | undefined,
  price: number | null,
  color: string,
  shape: "circle" | "square",
  text: string,
): SeriesMarker<Time> | null {
  if (!time || price == null) {
    return null;
  }

  return {
    id,
    time,
    price,
    color,
    shape,
    position: "atPriceMiddle",
    text,
    size: 1.4,
  };
}

function chartPalette(theme: ThemeMode) {
  if (theme === "dark") {
    return {
      background: "#111827",
      border: "#334155",
      text: "#e5e7eb",
      grid: "rgba(148, 163, 184, 0.14)",
      up: "#10b981",
      down: "#ef4444",
      entry: "#3b82f6",
      stop: "#ef4444",
      take: "#10b981",
      exit: "#f59e0b",
    };
  }

  return {
    background: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    grid: "rgba(148, 163, 184, 0.18)",
    up: "#059669",
    down: "#dc2626",
    entry: "#2563eb",
    stop: "#dc2626",
    take: "#059669",
    exit: "#d97706",
  };
}

export function TradeChart({
  symbol,
  assetClass,
  interval,
  side,
  openedAt,
  closedAt,
  entryPrice,
  initialStopLoss,
  initialTakeProfit,
  exitPrice,
}: TradeChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const requestKey = useMemo(
    () => JSON.stringify({ symbol, assetClass, interval, openedAt, closedAt }),
    [assetClass, closedAt, interval, openedAt, symbol],
  );
  const [state, setState] = useState<{
    requestKey: string | null;
    data: MarketDataResponse | null;
    error: string | null;
  }>({
    requestKey: null,
    data: null,
    error: null,
  });

  const palette = useMemo(() => chartPalette(theme), [theme]);
  const entry = useMemo(() => parseLevel(entryPrice), [entryPrice]);
  const stop = useMemo(() => parseLevel(initialStopLoss), [initialStopLoss]);
  const take = useMemo(() => parseLevel(initialTakeProfit), [initialTakeProfit]);
  const exit = useMemo(() => parseLevel(exitPrice), [exitPrice]);
  const data = state.requestKey === requestKey ? state.data : null;
  const error = state.requestKey === requestKey ? state.error : null;
  const loading = state.requestKey !== requestKey;
  const displayedInterval = useMemo(() => {
    if (data?.interval === "1min") return "1m";
    if (data?.interval === "1day") return "1D";
    if (data?.interval === "1week") return "1W";
    return interval ?? "15m";
  }, [data?.interval, interval]);

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
    const params = new URLSearchParams({
      symbol,
      assetClass,
      openedAt,
    });

    if (interval) params.set("interval", interval);
    if (closedAt) params.set("closedAt", closedAt);

    let cancelled = false;

    fetch(`/api/market-data?${params.toString()}`)
      .then(async (response) => {
        const payload = (await response.json()) as MarketDataResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossible de charger le graphique");
        }
        if (!cancelled) {
          setState({ requestKey, data: payload, error: null });
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setState({
            requestKey,
            data: null,
            error: requestError instanceof Error ? requestError.message : "Impossible de charger le graphique",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetClass, closedAt, interval, openedAt, requestKey, symbol]);

  const bars = useMemo<ChartBar[]>(() => {
    return (data?.bars ?? []).map((bar) => ({
      time: toChartTime(bar.time),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || bars.length === 0) return;

    chartRef.current?.remove();
    resizeObserverRef.current?.disconnect();

    const chart = createChart(container, {
      autoSize: true,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: palette.background },
        textColor: palette.text,
      },
      grid: {
        vertLines: { color: palette.grid },
        horzLines: { color: palette.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: palette.entry, width: 1, style: LineStyle.Dotted, labelBackgroundColor: palette.entry },
        horzLine: { color: palette.entry, width: 1, style: LineStyle.Dotted, labelBackgroundColor: palette.entry },
      },
      rightPriceScale: {
        borderColor: palette.border,
      },
      timeScale: {
        borderColor: palette.border,
        rightOffset: 12,
        barSpacing: 4,
        minBarSpacing: 1.5,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: palette.up,
      downColor: palette.down,
      borderVisible: false,
      wickUpColor: palette.up,
      wickDownColor: palette.down,
      lastValueVisible: true,
      priceLineVisible: false,
    });

    series.setData(bars);

    const chartInterval = data?.interval === "1min" ? "1m" : data?.interval === "1day" ? "1D" : data?.interval === "1week" ? "1W" : interval;
    const entryTime = resolveTradeBarTime(bars, openedAt, chartInterval);
    const exitTime = closedAt ? resolveTradeBarTime(bars, closedAt, chartInterval) : undefined;
    const markers = [
      buildTradeMarker(
        "entry",
        entryTime,
        entry,
        palette.entry,
        "circle",
        `Entry ${formatPrice(entry)}`,
      ),
      buildTradeMarker(
        "exit",
        exitTime,
        exit,
        palette.exit,
        "circle",
        `Exit ${formatPrice(exit)}`,
      ),
    ].filter((marker): marker is SeriesMarker<Time> => marker != null);

    createSeriesMarkers(series, markers, {
      autoScale: true,
      zOrder: "aboveSeries",
    });

    if (entryTime && exitTime && entry != null && exit != null) {
      series.attachPrimitive(
        new TradePathPrimitive(
          { time: entryTime, price: entry },
          { time: exitTime, price: exit },
          palette.exit,
        ),
      );
    }

    if (entry != null) {
      series.createPriceLine({
        price: entry,
        color: palette.entry,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: "PE",
      });
    }
    if (exit != null) {
      series.createPriceLine({
        price: exit,
        color: palette.exit,
        lineWidth: 2,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: "Sortie",
      });
    }

    const entryIndex = findBarIndex(bars, entryTime);
    const exitIndex = findBarIndex(bars, exitTime);
    const focusIndex = exitIndex >= 0 ? exitIndex : entryIndex;

    if (entryIndex >= 0) {
      const leftPadding = 180;
      const rightPadding = exitIndex >= 0 ? 180 : 360;
      const from = Math.max(0, entryIndex - leftPadding);
      const to = Math.min(
        bars.length - 1,
        Math.max(entryIndex, focusIndex >= 0 ? focusIndex : entryIndex) + rightPadding,
      );

      chart.timeScale().setVisibleLogicalRange({ from, to });
    } else {
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [bars, closedAt, entry, exit, interval, openedAt, palette]);

  const levels = [
    { label: "PE", value: entry, color: palette.entry },
    { label: "Sortie", value: exit, color: palette.exit },
  ].filter((level) => level.value != null);

  return (
    <div className="rounded-xl border border-border bg-surface-1 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">Graphique du trade</p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {symbol} · {displayedInterval}
          </p>
          {data?.providerSymbol ? (
            <p className="mt-1 text-xs text-secondary">Source: Twelve Data · {data.providerSymbol}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              side === "LONG" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            }`}
          >
            {side}
          </span>

          {levels.map((level) => (
            <span
              key={level.label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }} />
              <span className="font-semibold text-primary">{level.label}</span>
              <span className="font-mono text-secondary">{formatPrice(level.value)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-secondary">
            Chargement du graphique...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-secondary">
            {error}
          </div>
        ) : null}

        <div
          ref={containerRef}
          className={`${loading || error ? "hidden" : "block"} h-full w-full`}
        />
      </div>
    </div>
  );
}
