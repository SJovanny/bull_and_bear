// Chapitre 1 : une matière qui bouge (un sable de bougies japonaises) puis le titre « Tradez. Analysez. Grandissez. »
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, SANS, W, H, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw, rand } from "../motion";
import { Backdrop } from "../ui/Backdrop";

const N = 118;
const PITCH = W / N;
const BASE = 890;
const SCALE = 150;

const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
const RED: [number, number, number] = [239, 68, 68];
const GREEN: [number, number, number] = [16, 185, 129];

/** « Prix » de la bougie i à l'image f : bruit de marché qui s'apaise, tendance qui se révèle. */
const price = (i: number, f: number) => {
  const x = i / N;
  const calm = tw(f, 0, 120, 1, 0.3, INOUT);
  const wave = Math.sin(x * 9 + f * 0.045) * 0.55 + Math.sin(x * 21 - f * 0.07) * 0.3 + Math.sin(x * 37 + f * 0.11) * 0.15;
  const noise = Math.sin(i * 1.7 + f * 0.05 + rand(i) * 6.28) * 0.16 + Math.sin(i * 0.9 - f * 0.037 + rand(i + 9) * 6.28) * 0.1;
  const trend = x * 1.55 * (1 - calm * 0.55 + 0.45);
  return trend + (wave * 0.9 + noise * 2.2) * calm;
};

const Word: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = tw(f, at, at + 26, 0, 1, OUT);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: p,
        filter: `blur(${(1 - p) * 18}px)`,
        translate: `0 ${(1 - p) * 36}px`,
        scale: String(0.97 + p * 0.03),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Matter: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.matiere;
  const L = useCopy().matter;

  const candles = [];
  for (let i = 0; i < N; i++) {
    const o = price(i - 1, f);
    const c = price(i, f);
    const hi = Math.max(o, c) + 0.05 + rand(i + 3) * 0.14;
    const lo = Math.min(o, c) - 0.05 - rand(i + 5) * 0.14;
    const up = 0.5 + 0.5 * Math.tanh((c - o) * 7);
    const color = mix(RED, GREEN, up);
    const x = i * PITCH + PITCH / 2;
    const yO = BASE - o * SCALE;
    const yC = BASE - c * SCALE;
    const grow = tw(f, i * 0.35, i * 0.35 + 28, 0, 1, OUT);
    const op = grow * interpolate(i / N, [0, 0.06, 0.94, 1], [0.0, 1, 1, 0.6]);
    candles.push(
      <g key={i} opacity={op * 0.9}>
        <line x1={x} x2={x} y1={BASE - hi * SCALE} y2={BASE - lo * SCALE} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        <rect
          x={x - PITCH * 0.3}
          width={PITCH * 0.6}
          y={Math.min(yO, yC)}
          height={Math.max(8, Math.abs(yO - yC))}
          rx={3}
          fill={color}
        />
      </g>,
    );
  }

  // ligne de tendance qui se trace dans la matière
  const pts: string[] = [];
  for (let i = 0; i <= N; i += 2) {
    const x = i * PITCH;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(BASE - (i / N) * 1.55 * 1.2 * SCALE - 60).toFixed(1)}`);
  }
  const draw = tw(f, sec(a.trend), sec(a.trend + 3.2), 0, 1, INOUT);

  const smoke = [
    { c: C.brand, x: 300, y: 760, s: 900, o: 0.2, p: 0 },
    { c: C.teal, x: 1250, y: 820, s: 800, o: 0.17, p: 2 },
    { c: C.pos, x: 1650, y: 620, s: 700, o: 0.13, p: 4 },
    { c: C.neg, x: 650, y: 950, s: 620, o: 0.11, p: 1 },
  ];

  return (
    <AbsoluteFill>
      <Backdrop intensity={0.7} />
      {smoke.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.s,
            height: s.s,
            left: s.x - s.s / 2 + Math.sin(f / 70 + s.p) * 90,
            top: s.y - s.s / 2 + Math.cos(f / 85 + s.p) * 60,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${s.c} 0%, transparent 65%)`,
            opacity: s.o * tw(f, 0, 40, 0, 1),
            filter: "blur(40px)",
          }}
        />
      ))}

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={0} x2={W} y1={700 + k * 110} y2={700 + k * 110} stroke={C.border} strokeOpacity={0.22} strokeWidth={1} />
        ))}
        {candles}
        <path
          d={pts.join(" ")}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          fill="none"
          stroke={C.pos}
          strokeWidth={5}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 14px ${C.pos}99)` }}
          opacity={draw > 0 ? 0.95 : 0}
        />
      </svg>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 172, lineHeight: 1.04, letterSpacing: "-0.045em", textAlign: "center", color: C.text }}>
          <div>
            <Word at={sec(a.w1)}>{L.l1a}</Word> <Word at={sec(a.w2)}>{L.l1b}</Word>
          </div>
          <div>
            <Word
              at={sec(a.w3)}
              style={{ background: `linear-gradient(90deg, ${C.pos}, ${C.teal} 60%, #67e8f9)`, WebkitBackgroundClip: "text", color: "transparent" }}
            >
              {L.l2}
            </Word>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
