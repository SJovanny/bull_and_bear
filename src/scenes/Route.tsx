// Chapitre 8 : la « carte avec le trajet », adaptée au journal : Trade → Note → Analyse → Ajustement, jusqu'à la discipline.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, SANS, W, H, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw } from "../motion";
import { Backdrop } from "../ui/Backdrop";

const PATH = "M 210 830 C 430 830, 520 560, 770 540 S 1030 810, 1270 720 S 1520 380, 1730 300";
const STEPS = [
  { d: 0, x: 210, y: 830, color: C.text2 },
  { d: 0.31, x: 770, y: 540, color: C.brand },
  { d: 0.64, x: 1270, y: 720, color: C.teal },
  { d: 1, x: 1730, y: 300, color: C.pos },
];

export const Route: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.parcours;
  const L = useCopy().route;
  const len = getLength(PATH);
  const draw = tw(f, sec(a.draw), sec(a.drawEnd), 0, 1, INOUT);
  const tip = getPointAtLength(PATH, draw * len);
  const title = tw(f, 0, 24, 0, 1, OUT);
  const end = tw(f, sec(a.drawEnd), sec(a.drawEnd) + 20, 0, 1, OUT);

  return (
    <AbsoluteFill>
      <Backdrop tint="green" intensity={0.7} />
      {/* fond « carte » : quadrillage de rues et îlots */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 120 + 40} x2={i * 120 + 40} y1={0} y2={H} stroke={C.border} strokeOpacity={0.28} strokeWidth={i % 4 === 0 ? 3 : 1.2} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1={0} x2={W} y1={i * 120 + 60} y2={i * 120 + 60} stroke={C.border} strokeOpacity={0.28} strokeWidth={i % 3 === 0 ? 3 : 1.2} />
        ))}
        {[[160, 180, 200, 130], [820, 110, 240, 150], [1420, 140, 180, 150], [380, 600, 190, 120], [1010, 480, 160, 130], [1530, 560, 230, 150]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={16} fill={C.surface1} fillOpacity={0.5} stroke={C.border} strokeOpacity={0.3} />
        ))}
      </svg>

      <div style={{ position: "absolute", left: 110, top: 86, fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: "-0.045em", lineHeight: 1.05, color: C.text, opacity: title, translate: `0 ${(1 - title) * 26}px` }}>
        {L.l1}
        <div style={{ color: C.text2, fontWeight: 600, fontSize: 70 }}>
          {L.l2}<span style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.pos})`, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }}>{L.accent}</span>
        </div>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={PATH} fill="none" stroke={C.border} strokeWidth={10} strokeLinecap="round" strokeOpacity={0.55} />
        <path d={PATH} fill="none" stroke={C.pos} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: `drop-shadow(0 0 16px ${C.pos}aa)` }} />
        {tip && draw > 0 && draw < 1 && <circle cx={tip.x} cy={tip.y} r={16} fill="#d1fae5" stroke={C.pos} strokeWidth={5} style={{ filter: `drop-shadow(0 0 18px ${C.pos})` }} />}
      </svg>

      {STEPS.map((s, i) => {
        const reached = tw(draw, s.d - 0.02, s.d + 0.04, 0, 1, OUT);
        const at = i === 0 ? tw(f, 4, 24, 0, 1, OUT) : reached;
        const last = i === STEPS.length - 1;
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, opacity: at, fontFamily: SANS }}>
            <div style={{ position: "absolute", left: -(last ? 42 : 30), top: -(last ? 42 : 30), width: last ? 84 : 60, height: last ? 84 : 60, borderRadius: "50%", background: C.bg, border: `6px solid ${s.color}`, boxShadow: `0 0 36px ${s.color}88`, scale: String(0.6 + at * 0.4), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: last ? 40 : 28, color: s.color }}>
              {last ? "✓" : i + 1}
            </div>
            <div style={{ position: "absolute", left: -90, top: last ? 64 : 50, width: 180, textAlign: "center", fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em", color: C.text, textShadow: "0 4px 24px rgba(0,0,0,0.8)", translate: `0 ${(1 - at) * 14}px` }}>{L.steps[i]}</div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 1730 - 180, top: 300 - 150, width: 360, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.pos, opacity: end, translate: `0 ${(1 - end) * 12}px` }}>{L.loop}</div>
    </AbsoluteFill>
  );
};
