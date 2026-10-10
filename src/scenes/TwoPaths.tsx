// Chapitre 5 : deux chemins vers le même journal. cTrader se synchronise tout seul ; MetaTrader : un fichier, un clic,
// doublons écartés (fidèle à trade-import-modal.tsx : « Preview import », « ready to import », « duplicate(s) », « Import »).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw } from "../motion";
import { TRADES } from "../data";
import { Backdrop } from "../ui/Backdrop";
import { Tap } from "../ui/Phone";
import { useStage } from "../stage";

const ROWS = [
  { sym: "EURUSD", net: "+48,00", dup: false },
  { sym: "XAUUSD", net: "-31,50", dup: false },
  { sym: "BTCUSD", net: "+65,20", dup: false },
  { sym: "GBPUSD", net: "+22,40", dup: true },
  { sym: "USDJPY", net: "+36,10", dup: false },
];

const Pill: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ fontFamily: SANS, fontSize: 19, fontWeight: 700, color, background: `${color}22`, borderRadius: 999, padding: "5px 14px" }}>{children}</span>
);

const Panel: React.FC<{ v: boolean; x: number; y: number; at: number; f: number; name: string; tag: string; tagColor: string; children: React.ReactNode; dim: number }> = ({ v, x, y, at, f, name, tag, tagColor, children, dim }) => {
  const p = tw(f, at, at + 24, 0, 1, OUT);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: v ? 960 : 790,
        height: v ? 740 : 800,
        borderRadius: 32,
        background: `linear-gradient(180deg, ${C.surface1}, ${C.bg})`,
        border: `1.5px solid ${C.border}`,
        boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
        opacity: p * (1 - dim * 0.78),
        translate: `0 ${(1 - p) * 60}px`,
        scale: String(1 - dim * 0.06),
        filter: `blur(${dim * 5}px)`,
        fontFamily: SANS,
        padding: 34,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.035em", color: C.text }}>{name}</div>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: tagColor, background: `${tagColor}1f`, border: `1.5px solid ${tagColor}66`, borderRadius: 999, padding: "9px 20px" }}>{tag}</span>
      </div>
      {children}
    </div>
  );
};

export const TwoPaths: React.FC = () => {
  const f = useCurrentFrame();
  const { v } = useStage();
  const a = useTimings().A.chemins;
  const L = useCopy().paths;
  const merge = tw(f, sec(a.merge), sec(a.merge) + 30, 0, 1, INOUT);

  // gauche : trades qui tombent tout seuls
  const spin = f * 5;
  const logP = (i: number) => tw(f, sec(a.left + 0.7 + i * 0.42), sec(a.left + 0.7 + i * 0.42) + 16, 0, 1, OUT);
  const imported = Math.round(TRADES * tw(f, sec(a.left + 0.7), sec(a.left + 3.2), 0, 1, OUT));

  // droite : fichier -> aperçu -> import
  const file = tw(f, sec(a.file), sec(a.file) + 20, 0, 1, OUT);
  const preview = tw(f, sec(a.preview), sec(a.preview) + 20, 0, 1, OUT);
  const press = tw(f, sec(a.tapImport) - 4, sec(a.tapImport) + 4, 0, 1);
  const done = tw(f, sec(a.tapImport) + 6, sec(a.tapImport) + 22, 0, 1);

  return (
    <AbsoluteFill>
      <Backdrop />
      <Panel v={v} x={v ? 60 : 110} y={v ? 80 : 118} at={sec(a.left)} f={f} name="cTrader" tag={L.autoTag} tagColor={C.pos} dim={merge}>
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 96, height: 96, borderRadius: 28, background: `${C.brand}1f`, border: `1.5px solid ${C.brand}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ rotate: `${spin}deg` }}>
              <path d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 12a8 8 0 01-13.7 5.6L4 15.3M20 4v5h-5M4 20v-5h5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{L.autoTitle}</div>
            <div style={{ marginTop: 6, fontSize: 26, color: C.text2 }}>{L.autoSub}</div>
          </div>
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 11 }}>
          {ROWS.map((r, i) => {
            const p = logP(i);
            const neg = r.net.startsWith("-");
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 22px", borderRadius: 18, background: C.surface2, border: `1px solid ${C.border}`, opacity: p, translate: `0 ${(1 - p) * 26}px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: neg ? C.neg : C.pos }} />
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.text }}>{r.sym}</span>
                  <span style={{ fontSize: 22, color: C.text2 }}>cTrader</span>
                </div>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: neg ? C.neg : C.pos }}>{r.net}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, borderRadius: 18, background: `${C.pos}1a`, border: `1px solid ${C.pos}44`, padding: "16px 22px", fontSize: 28, color: C.pos, fontWeight: 600, opacity: tw(f, sec(a.left + 1.0), sec(a.left + 1.4)) }}>
          {imported} new trades imported
        </div>
      </Panel>

      <Panel v={v} x={v ? 60 : 1020} y={v ? 835 : 118} at={sec(a.right)} f={f} name="MetaTrader" tag={L.oneClickTag} tagColor={C.brand} dim={merge}>
        <div style={{ position: "relative" }}>
          <div style={{ marginTop: 22, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 24, color: C.text2, fontWeight: 600 }}>Source</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.text, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 20px" }}>MetaTrader</div>
            <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.text, background: `${C.brand}1f`, border: `1.5px solid ${C.brand}77`, borderRadius: 14, padding: "10px 18px", opacity: file, translate: `0 ${(1 - file) * -90}px`, scale: String(0.9 + file * 0.1) }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5" /></svg>
              Account History.xlsx
            </div>
          </div>
          <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 24px", opacity: file }}>Preview import</div>
          </div>

          <div style={{ marginTop: 22, borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface2, overflow: "hidden", opacity: preview, translate: `0 ${(1 - preview) * 24}px` }}>
            <div style={{ display: "flex", padding: "12px 20px", fontSize: 17, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.text2, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 70 }}>Row</div><div style={{ flex: 1 }}>Trade</div><div style={{ width: 130 }}>Net</div><div style={{ width: 250 }}>Status</div>
            </div>
            {ROWS.map((r, i) => {
              const rp = tw(f, sec(a.preview) + i * 4, sec(a.preview) + i * 4 + 14);
              const neg = r.net.startsWith("-");
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 20px", borderBottom: i < ROWS.length - 1 ? `1px solid ${C.border}66` : undefined, opacity: rp * (r.dup ? 0.55 : 1), fontSize: 24 }}>
                  <div style={{ width: 70, fontFamily: MONO, color: C.text2 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, color: C.text }}>{r.sym}</div>
                  <div style={{ width: 130, fontFamily: MONO, fontWeight: 700, color: neg ? C.neg : C.pos }}>{r.net}</div>
                  <div style={{ width: 250 }}>{r.dup ? <Pill color={C.text2}>Already imported</Pill> : <Pill color={C.pos}>Ready</Pill>}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 22, fontSize: 22, color: C.text2, opacity: preview }}>
            <span><b style={{ color: C.text }}>{TRADES + 1}</b> line(s) detected</span>
            <span><b style={{ color: C.pos }}>{TRADES}</b> ready to import</span>
            <span><b style={{ color: C.text2 }}>1</b> duplicate(s)</span>
          </div>

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, opacity: preview }}>
            <div style={{ height: 62, padding: "0 46px", display: "flex", alignItems: "center", borderRadius: 16, background: C.brand, fontSize: 26, fontWeight: 700, color: "#fff", boxShadow: `0 0 ${34 * press}px ${C.brand}99` }}>Import</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.pos, opacity: done }}>✓ {TRADES} trades imported</div>
          </div>
          <Tap f={f} at={sec(a.tapImport)} x={89} y={563} />
        </div>
      </Panel>

      {/* fusion : même journal, mêmes statistiques */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: merge, translate: `0 ${(1 - merge) * 30}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: v ? 92 : 112, letterSpacing: "-0.045em", textAlign: "center", color: C.text, lineHeight: 1.05, textShadow: "0 10px 60px rgba(0,0,0,0.7)" }}>
          {L.one}
          <div style={{ background: `linear-gradient(90deg, ${C.brand}, ${C.teal})`, WebkitBackgroundClip: "text", color: "transparent" }}>{L.same}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
