// Chapitre « revue » : on rouvre le trade sur le VRAI graphique de l'app (lightweight-charts de TradingView, même composant que
// apps/web/src/components/trade-chart.tsx) : les bougies se posent, l'entrée et la sortie sont marquées, le trade reste là, tel qu'il était.
// Le graphique est recréé à chaque image à partir de la progression (rendu déterministe). Temps (secondes locales) : A.revue dans timings.ts.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, useCurrentFrame } from "remotion";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  createSeriesMarkers,
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
  type UTCTimestamp,
  type WhitespaceData,
} from "lightweight-charts";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw, rand } from "../motion";
import { Backdrop } from "../ui/Backdrop";
import { useStage } from "../stage";

// Bougies EURUSD 1m (déterministes) : range, cassure, montée — l'entrée est juste avant la cassure, la sortie en haut.
const N = 46;
const ENTRY = 14;
const EXIT = 38;
const T0 = 1_772_000_000;
const price = (p: number) => 1.0805 + p * 0.0062;
const BARS = (() => {
  let p = 0.34;
  return Array.from({ length: N }, (_, i) => {
    const drift = i < ENTRY ? Math.sin(i * 1.3) * 0.02 : i < EXIT ? 0.017 : -0.012;
    const o = p;
    const c = Math.min(0.92, Math.max(0.08, o + drift + (rand(i + 11) - 0.5) * 0.06));
    p = c;
    const h = Math.max(o, c) + 0.012 + rand(i + 31) * 0.035;
    const l = Math.min(o, c) - 0.012 - rand(i + 51) * 0.035;
    return { time: (T0 + i * 60) as UTCTimestamp, open: price(o), high: price(h), low: price(l), close: price(c) };
  });
})();
const ENTRY_PRICE = BARS[ENTRY].close;
const EXIT_PRICE = BARS[EXIT].close;

// même couleurs que le thème sombre de l'app (trade-chart.tsx → chartPalette)
const PAL = { background: "#111827", border: "#334155", text: "#e5e7eb", grid: "rgba(148, 163, 184, 0.14)", up: "#10b981", down: "#ef4444", entry: "#3b82f6", exit: "#f59e0b" };

type Pt = { time: Time; price: number };

/** Trait pointillé entrée → sortie (primitive de l'app), tracé jusqu'à `progress` (0..1). */
class TradePath implements ISeriesPrimitive<Time> {
  private chart: IChartApi | null = null;
  private series: ISeriesApi<SeriesType, Time> | null = null;
  constructor(private from: Pt, private to: Pt, private progress: number, private color: string) {}
  attached(p: SeriesAttachedParameter<Time, SeriesType>) {
    this.chart = p.chart as IChartApi;
    this.series = p.series;
  }
  detached() {
    this.chart = null;
    this.series = null;
  }
  paneViews(): IPrimitivePaneView[] {
    const { chart, series, from, to, progress, color } = this;
    if (!chart || !series) return [];
    const renderer: IPrimitivePaneRenderer = {
      draw: (target) =>
        target.useMediaCoordinateSpace(({ context }) => {
          const x1 = chart.timeScale().timeToCoordinate(from.time);
          const y1 = series.priceToCoordinate(from.price);
          const x2 = chart.timeScale().timeToCoordinate(to.time);
          const y2 = series.priceToCoordinate(to.price);
          if (x1 == null || y1 == null || x2 == null || y2 == null) return;
          context.save();
          context.beginPath();
          context.setLineDash([8, 6]);
          context.moveTo(x1, y1);
          context.lineTo(x1 + (x2 - x1) * progress, y1 + (y2 - y1) * progress);
          context.lineWidth = 3;
          context.strokeStyle = color;
          context.stroke();
          context.restore();
        }),
    };
    return [{ zOrder: () => "top" as const, renderer: () => renderer }];
  }
}

const TradingViewChart: React.FC<{ width: number; height: number; shown: number; entry: boolean; exit: boolean; link: number; labels: { entry: string; exit: string } }> = ({
  width,
  height,
  shown,
  entry,
  exit,
  link,
  labels,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = delayRender("lightweight-charts");
    const chart = createChart(el, {
      width,
      height,
      layout: { background: { type: ColorType.Solid, color: PAL.background }, textColor: PAL.text, fontFamily: SANS, fontSize: 14 },
      grid: { vertLines: { color: PAL.grid }, horzLines: { color: PAL.grid } },
      rightPriceScale: { borderColor: PAL.border, scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: { borderColor: PAL.border, timeVisible: true, secondsVisible: false, rightOffset: 0, fixLeftEdge: true, fixRightEdge: true },
      crosshair: { mode: CrosshairMode.Hidden },
      handleScroll: false,
      handleScale: false,
      localization: { priceFormatter: (v: number) => v.toFixed(4) },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: PAL.up,
      downColor: PAL.down,
      wickUpColor: PAL.up,
      wickDownColor: PAL.down,
      borderVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // les bougies non encore posées restent des « blancs » : l'échelle de temps ne bouge pas
    const whole = Math.floor(shown);
    const part = shown - whole;
    const data: (CandlestickData<Time> | WhitespaceData<Time>)[] = BARS.map((b, i) => {
      if (i < whole) return b;
      if (i === whole && part > 0.02) {
        const k = part;
        return { time: b.time, open: b.open, close: b.open + (b.close - b.open) * k, high: b.open + (b.high - b.open) * k, low: b.open + (b.low - b.open) * k };
      }
      return { time: b.time };
    });
    series.setData(data);

    const markers: SeriesMarker<Time>[] = [];
    if (entry) markers.push({ time: BARS[ENTRY].time, position: "atPriceMiddle", price: ENTRY_PRICE, color: PAL.entry, shape: "circle", text: labels.entry, size: 1.4 } as SeriesMarker<Time>);
    if (exit) markers.push({ time: BARS[EXIT].time, position: "atPriceMiddle", price: EXIT_PRICE, color: PAL.exit, shape: "circle", text: labels.exit, size: 1.4 } as SeriesMarker<Time>);
    createSeriesMarkers(series, markers);

    if (entry) series.createPriceLine({ price: ENTRY_PRICE, color: PAL.entry, lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: "PE" });
    if (exit) series.createPriceLine({ price: EXIT_PRICE, color: PAL.exit, lineWidth: 2, lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: labels.exit });
    if (exit && link > 0) {
      series.attachPrimitive(new TradePath({ time: BARS[ENTRY].time, price: ENTRY_PRICE }, { time: BARS[EXIT].time, price: EXIT_PRICE }, link, PAL.exit));
    }

    chart.timeScale().setVisibleLogicalRange({ from: -0.5, to: N - 0.5 });
    chart.priceScale("right").applyOptions({ autoScale: true });

    // le graphique se peint dans un requestAnimationFrame : on laisse passer deux images avant de rendre la main à Remotion
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => continueRender(handle));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      try {
        chart.remove();
      } catch (e) {
        cancelRender(e);
      }
    };
  }, [width, height, Math.round(shown * 20), entry, exit, Math.round(link * 30)]);

  return <div ref={ref} style={{ width, height, borderRadius: 18, overflow: "hidden" }} />;
};

export const ChartReview: React.FC = () => {
  const f = useCurrentFrame();
  const { v } = useStage();
  const a = useTimings().A.revue;
  const L = useCopy().review;

  const GW = v ? 860 : 1380;
  const GH = v ? 760 : 520;

  const card = tw(f, sec(a.card), sec(a.card) + 18, 0, 1, OUT);
  const grow = tw(f, sec(a.candles), sec(a.candlesEnd), 0, 1, INOUT);
  const entry = f >= sec(a.entry);
  const exit = f >= sec(a.exit);
  const link = tw(f, sec(a.exit), sec(a.exit) + 16, 0, 1, OUT);
  const tag = tw(f, sec(a.tag), sec(a.tag) + 16, 0, 1, OUT);

  return (
    <AbsoluteFill>
      <Backdrop tint="neutral" intensity={0.8} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SANS, paddingBottom: v ? 240 : 0 }}>
        <div
          style={{
            width: v ? 960 : 1560,
            borderRadius: 34,
            background: C.surface1,
            border: `1.5px solid ${C.border}`,
            boxShadow: "0 40px 110px rgba(0,0,0,0.55)",
            opacity: card,
            translate: `0 ${(1 - card) * 60}px`,
            scale: String(0.96 + card * 0.04),
            padding: v ? "36px 50px 44px" : "40px 90px 48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>EURUSD</span>
            <span style={{ fontSize: 24, fontWeight: 600, color: C.text2 }}>· 1m</span>
            <span style={{ marginLeft: "auto", fontSize: 22, fontWeight: 700, color: C.brand, background: "rgba(59,130,246,0.14)", border: `1.5px solid ${C.brand}66`, padding: "7px 18px", borderRadius: 999, opacity: tag }}>
              {L.badge}
            </span>
          </div>

          <div style={{ marginTop: 26 }}>
            <TradingViewChart width={GW} height={GH} shown={grow * N} entry={entry} exit={exit} link={link} labels={{ entry: L.entry, exit: L.exit }} />
          </div>

          <div style={{ marginTop: 26, display: "flex", gap: 14, alignItems: "baseline", opacity: tag, translate: `0 ${(1 - tag) * 14}px` }}>
            <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.text }}>{L.caption}</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
