// Chapitre 10 : le logo se forme (le B vert du Bull monte, le B rouge du Bear descend), puis l'appel à l'action.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, tw } from "../motion";
import { Backdrop } from "../ui/Backdrop";
import { useStage } from "../stage";

const MW = 900;
const MH = 452;
const SPLIT = 51.7; // % : frontière entre le B vert et le B rouge dans BB_mark.png
const S = 0.86;

export const LogoEnd: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.logo;
  const L = useCopy().logo;
  const { w, v } = useStage();
  const g = tw(f, sec(a.b1), sec(a.b1) + 34, 0, 1, OUT);
  const r = tw(f, sec(a.b2), sec(a.b2) + 34, 0, 1, OUT);
  const name = tw(f, sec(a.name), sec(a.name) + 26, 0, 1, OUT);
  const tag = tw(f, sec(a.tag), sec(a.tag) + 22, 0, 1, OUT);
  const cta = tw(f, sec(a.cta), sec(a.cta) + 24, 0, 1, OUT);
  const glow = tw(f, sec(a.b2) + 20, sec(a.name) + 20, 0, 1);

  const Half: React.FC<{ clip: string; p: number; dx: number; dy: number }> = ({ clip, p, dx, dy }) => (
    <Img
      src={staticFile("brand/BB_mark.png")}
      style={{ position: "absolute", left: 0, top: 0, width: MW * S, height: MH * S, clipPath: clip, opacity: p, translate: `${(1 - p) * dx}px ${(1 - p) * dy}px` }}
    />
  );

  return (
    <AbsoluteFill>
      <Backdrop intensity={1.1} />
      <div style={{ position: "absolute", left: w / 2 - 520, top: (v ? 480 : 270) - 300, width: 1040, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.pos}26, ${C.neg}14 45%, transparent 70%)`, opacity: glow, filter: "blur(30px)" }} />

      <div style={{ position: "absolute", left: w / 2 - (MW * S) / 2, top: v ? 400 : 60, width: MW * S, height: MH * S, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}>
        <Half clip={`inset(0 ${100 - SPLIT}% 0 0)`} p={g} dx={-160} dy={90} />
        <Half clip={`inset(0 0 0 ${SPLIT}%)`} p={r} dx={160} dy={-90} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 840 : 500, display: "flex", justifyContent: "center", alignItems: "center", gap: v ? 24 : 36, opacity: name, translate: `0 ${(1 - name) * 20}px`, fontFamily: SANS }}>
        <div style={{ width: v ? 60 : 150, height: 3, background: C.border }} />
        <div style={{ fontWeight: 800, fontSize: v ? 62 : 84, letterSpacing: "0.2em", color: C.text, paddingLeft: "0.2em" }}>BULL &amp; BEAR</div>
        <div style={{ width: v ? 60 : 150, height: 3, background: C.border }} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 930 : 604, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: v ? 44 : 46, letterSpacing: "-0.02em", color: C.text, opacity: tag, translate: `0 ${(1 - tag) * 18}px` }}>
        {L.tagline}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 1090 : 715, textAlign: "center", fontFamily: SANS, opacity: cta, translate: `0 ${(1 - cta) * 24}px` }}>
        <div style={{ display: "inline-flex", alignItems: "center", height: 98, padding: "0 64px", borderRadius: 26, background: C.brand, color: "#fff", fontWeight: 800, fontSize: 46, letterSpacing: "-0.02em", boxShadow: `0 0 70px ${C.brand}77` }}>{L.cta}</div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.text2, letterSpacing: "-0.01em" }}>bullandbear.pro</div>
      </div>

      <div style={{ position: "absolute", left: v ? 60 : 120, right: v ? 60 : 120, bottom: v ? 120 : 40, textAlign: "center", fontFamily: SANS, fontSize: 20, color: C.text2, opacity: cta * 0.8 }}>
        {L.legal}
      </div>
    </AbsoluteFill>
  );
};
