// Chapitre « journal » : une fiche de trade fictive qui se remplit — la courbe se trace, le PnL monte, puis le setup, l'émotion et la note (« tes erreurs »).
// Les temps (secondes locales) sont dans timings.ts (A.journal) et suivent les mots de la ligne de voix : « Ta courbe. Ton PnL. Tes erreurs. Enfin, tu vois tout. »
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy, useLang } from "../lang";
import { OUT, INOUT, tw, rand, fmtL } from "../motion";
import { Backdrop } from "../ui/Backdrop";
import { useStage } from "../stage";

// Courbe de PnL du trade (déterministe) : montée, creux, reprise, sortie.
const PTS = Array.from({ length: 36 }, (_, i) => {
  const t = i / 35;
  const base = 0.12 + 0.78 * t + 0.1 * Math.sin(t * 9) - 0.2 * Math.exp(-Math.pow((t - 0.38) / 0.09, 2));
  return Math.min(0.97, Math.max(0.04, base + (rand(i + 7) - 0.5) * 0.05));
});
const pathFor = (CW: number, CH: number) => PTS.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (PTS.length - 1)) * CW},${CH - p * CH}`).join(" ");
const ENTRY = 5;
const EXIT = PTS.length - 1;
const PNL = 48.0;

const Field: React.FC<{ label: string; p: number; children: React.ReactNode }> = ({ label, p, children }) => (
  <div style={{ opacity: p, translate: `0 ${(1 - p) * 22}px` }}>
    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text2, marginBottom: 10 }}>{label}</div>
    {children}
  </div>
);

export const Journal: React.FC = () => {
  const f = useCurrentFrame();
  const lang = useLang();
  const { v } = useStage();
  const CW = v ? 860 : 700;
  const CH = v ? 360 : 330;
  const path = pathFor(CW, CH);
  const a = useTimings().A.journal;
  const L = useCopy().journal;

  const card = tw(f, sec(a.card), sec(a.card) + 22, 0, 1, OUT);
  const curve = tw(f, sec(a.curve), sec(a.curveEnd), 0, 1, INOUT);
  const pnl = tw(f, sec(a.pnl), sec(a.pnlEnd), 0, 1, OUT);
  const setup = tw(f, sec(a.setup), sec(a.setup) + 18, 0, 1, OUT);
  const emo = tw(f, sec(a.emo), sec(a.emo) + 16, 0, 1, OUT);
  const noteBox = tw(f, sec(a.emo) + 6, sec(a.emo) + 22, 0, 1, OUT);
  const typed = tw(f, sec(a.note), sec(a.noteEnd), 0, 1, (n) => n);
  const tag = tw(f, sec(a.tag), sec(a.tag) + 16, 0, 1, OUT);
  const all = tw(f, sec(a.all), sec(a.all) + 24, 0, 1, OUT);

  const shown = L.note.slice(0, Math.round(typed * L.note.length));
  const lastX = curve * CW;
  const idx = Math.min(PTS.length - 1, Math.round(curve * (PTS.length - 1)));
  const lastY = CH - PTS[idx] * CH;

  return (
    <AbsoluteFill>
      <Backdrop tint="neutral" intensity={0.8} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SANS, paddingBottom: v ? 240 : 0 }}>
        <div
          style={{
            width: v ? 960 : 1640,
            height: v ? 1250 : 760,
            borderRadius: 36,
            background: C.surface1,
            border: `1.5px solid ${C.border}`,
            boxShadow: `0 40px 110px rgba(0,0,0,0.55), 0 0 ${all * 60}px rgba(59,130,246,${all * 0.25})`,
            opacity: card,
            translate: `0 ${(1 - card) * 60}px`,
            scale: String(0.96 + card * 0.04),
            display: "flex",
            flexDirection: v ? "column" : "row",
            overflow: "hidden",
          }}
        >
          {/* gauche : le trade, sa courbe et son PnL */}
          <div style={{ width: v ? "auto" : 820, padding: v ? "38px 50px 30px" : "44px 56px", borderRight: v ? undefined : `1px solid ${C.border}`, borderBottom: v ? `1px solid ${C.border}` : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>{L.symbol}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.pos, background: "rgba(16,185,129,0.14)", padding: "6px 16px", borderRadius: 999 }}>{L.side}</span>
              <span style={{ marginLeft: "auto", fontSize: 24, color: C.text2 }}>{L.title}</span>
            </div>
            <div style={{ position: "relative", width: CW, height: CH, marginTop: 36 }}>
              <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ overflow: "visible" }}>
                {[0.25, 0.5, 0.75].map((g) => (
                  <line key={g} x1={0} x2={CW} y1={CH * g} y2={CH * g} stroke={C.border} strokeOpacity={0.45} strokeDasharray="4 8" />
                ))}
                <defs>
                  <linearGradient id="jfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={C.pos} stopOpacity="0.28" />
                    <stop offset="1" stopColor={C.pos} stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="jclip">
                    <rect x={0} y={-10} width={lastX} height={CH + 20} />
                  </clipPath>
                </defs>
                <g clipPath="url(#jclip)">
                  <path d={`${path} L${CW},${CH} L0,${CH} Z`} fill="url(#jfill)" />
                  <path d={path} fill="none" stroke={C.pos} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
                {/* entrée / sortie */}
                {[{ i: ENTRY, label: L.entry }, { i: EXIT, label: L.exit }].map((m) => {
                  const x = (m.i / (PTS.length - 1)) * CW;
                  const y = CH - PTS[m.i] * CH;
                  const on = tw(f, sec(a.curve) + (m.i / (PTS.length - 1)) * (sec(a.curveEnd) - sec(a.curve)), sec(a.curve) + (m.i / (PTS.length - 1)) * (sec(a.curveEnd) - sec(a.curve)) + 10, 0, 1, OUT);
                  return (
                    <g key={m.label} opacity={on}>
                      <circle cx={x} cy={y} r={11} fill={C.bg} stroke={C.brand} strokeWidth={4} />
                      <text x={x} y={y + (m.i === EXIT ? 44 : -22)} textAnchor={m.i === EXIT ? "end" : "middle"} fontFamily={SANS} fontSize={22} fontWeight={700} fill={C.text2}>
                        {m.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx={lastX} cy={lastY} r={8} fill={C.pos} opacity={curve > 0 && curve < 1 ? 1 : 0} />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 34 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: C.text2 }}>{L.pnlLabel}</span>
              <span style={{ fontFamily: MONO, fontSize: 84, fontWeight: 700, letterSpacing: "-0.04em", color: C.pos, opacity: 0.35 + pnl * 0.65 }}>
                +{fmtL(PNL * pnl, 2, lang)} €
              </span>
            </div>
          </div>

          {/* droite : le journal */}
          <div style={{ flex: 1, padding: v ? "32px 50px" : "44px 56px", display: "flex", flexDirection: "column", gap: v ? 24 : 30 }}>
            <Field label={L.setupLabel} p={setup}>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", color: C.text }}>{L.setup}</div>
            </Field>
            <Field label={L.emotionLabel} p={emo}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {L.emotions.map((e) => {
                  const hit = e === L.emotion;
                  return (
                    <span
                      key={e}
                      style={{
                        fontSize: 26,
                        fontWeight: 600,
                        padding: "9px 22px",
                        borderRadius: 999,
                        color: hit ? C.warn : C.text2,
                        background: hit ? "rgba(245,158,11,0.16)" : C.surface2,
                        border: `1.5px solid ${hit ? C.warn : C.border}`,
                      }}
                    >
                      {e}
                    </span>
                  );
                })}
              </div>
            </Field>
            <Field label={L.noteLabel} p={noteBox}>
              <div style={{ minHeight: v ? 150 : 190, borderRadius: 20, background: C.surface2, border: `1.5px solid ${C.border}`, padding: "22px 26px", fontSize: v ? 29 : 31, lineHeight: 1.4, fontWeight: 500, color: C.text }}>
                {shown}
                <span style={{ display: "inline-block", width: 3, height: 34, background: C.brand, marginLeft: 3, verticalAlign: "-6px", opacity: typed < 1 ? 1 : 0 }} />
              </div>
            </Field>
            <Field label={L.mistakeLabel} p={tag}>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.neg, background: "rgba(239,68,68,0.14)", border: `1.5px solid ${C.neg}`, padding: "9px 22px", borderRadius: 14 }}>
                {L.mistake}
              </span>
            </Field>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
