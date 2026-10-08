// Chapitre 9 : des chiffres qui s'animent (exemples de démonstration) + les trois vrais chiffres de la landing.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy, useLang } from "../lang";
import { OUT, INOUT, tw, fmtL } from "../motion";
import { DEMO } from "../data";
import { Backdrop } from "../ui/Backdrop";

const Tile: React.FC<{ f: number; at: number; label: string; children: React.ReactNode; note?: string }> = ({ f, at, label, children, note }) => {
  const p = tw(f, sec(at), sec(at) + 22, 0, 1, OUT);
  return (
    <div style={{ width: 520, height: 400, borderRadius: 32, background: `linear-gradient(180deg, ${C.surface1}, ${C.bg})`, border: `1.5px solid ${C.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)", padding: 34, fontFamily: SANS, opacity: p, translate: `0 ${(1 - p) * 60}px`, scale: String(0.94 + p * 0.06), display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text2 }}>{label}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>{children}</div>
      {note && <div style={{ fontSize: 22, color: C.text2, textAlign: "center" }}>{note}</div>}
    </div>
  );
};

export const Numbers: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.chiffres;
  const L = useCopy().numbers;
  const lang = useLang();
  const w = tw(f, sec(a.win), sec(a.win) + 50, 0, 1, INOUT);
  const pf = tw(f, sec(a.pf), sec(a.pf) + 50, 0, 1, INOUT);
  const dd = tw(f, sec(a.dd), sec(a.dd) + 50, 0, 1, INOUT);
  const R = 92;
  const circ = 2 * Math.PI * R;
  const strip = tw(f, sec(a.strip), sec(a.strip) + 20, 0, 1, OUT);
  const title = tw(f, 0, 22, 0, 1, OUT);

  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: 0, right: 0, top: 78, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: "-0.045em", color: C.text, opacity: title, translate: `0 ${(1 - title) * 24}px` }}>
        {L.title[0]}<span style={{ background: `linear-gradient(90deg, ${C.brand}, ${C.teal})`, WebkitBackgroundClip: "text", color: "transparent" }}>{L.title[1]}</span>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", gap: 40 }}>
        <Tile f={f} at={a.win} label={L.win} note={L.example}>
          <div style={{ position: "relative", width: 230, height: 230 }}>
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r={R} fill="none" stroke={C.surface2} strokeWidth="22" />
              <circle cx="115" cy="115" r={R} fill="none" stroke={C.brand} strokeWidth="22" strokeLinecap="round" strokeDasharray={`${(DEMO.winRate / 100) * w * circ} ${circ}`} transform="rotate(-90 115 115)" style={{ filter: `drop-shadow(0 0 12px ${C.brand}99)` }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 68, color: C.text, letterSpacing: "-0.04em" }}>{Math.round(DEMO.winRate * w)}%</div>
          </div>
        </Tile>
        <Tile f={f} at={a.pf} label={L.pf} note={L.exampleTarget}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 130, color: C.pos, letterSpacing: "-0.05em", textShadow: `0 0 40px ${C.pos}55` }}>{fmtL(1 + (DEMO.profitFactor - 1) * pf, 2, lang)}</div>
          <div style={{ marginTop: 18, width: 380, height: 14, borderRadius: 7, background: C.surface2 }}>
            <div style={{ width: `${Math.min(100, ((1 + (DEMO.profitFactor - 1) * pf) / 3) * 100)}%`, height: 14, borderRadius: 7, background: C.pos }} />
          </div>
        </Tile>
        <Tile f={f} at={a.dd} label={L.dd} note={L.example}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 130, color: C.text, letterSpacing: "-0.05em" }}>{fmtL(DEMO.maxDrawdown * dd, 1, lang)}<span style={{ fontSize: 64 }}>%</span></div>
          <svg width="380" height="70" viewBox="0 0 380 70" style={{ marginTop: 10 }}>
            <path d="M0 8 C60 8 70 12 110 26 S150 22 190 38 S250 30 290 52 S340 30 380 14" fill="none" stroke={C.neg} strokeWidth="5" strokeLinecap="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - dd} />
          </svg>
        </Tile>
      </div>

      {/* les vrais chiffres de la landing (landing.about.stat1-3) */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 176, display: "flex", justifyContent: "center", gap: 110, fontFamily: SANS, opacity: strip, translate: `0 ${(1 - strip) * 20}px` }}>
        {L.strip.map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 70, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>{s.v}</div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 500, color: C.text2 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
