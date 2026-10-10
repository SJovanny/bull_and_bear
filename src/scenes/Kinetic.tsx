// Chapitre 2 : typographie cinétique. Les mots arrivent un par un, puis « pourquoi ? » prend tout l'écran.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useStage } from "../stage";
import { useTimings, useCopy } from "../lang";
import { OUT, tw, rand, INOUT } from "../motion";
import { Backdrop } from "../ui/Backdrop";

const NUMS = ["-42,10", "+18,60", "-130,00", "+7,25", "-64,80", "+92,40", "-12,50", "+55,00", "-88,30", "+31,70", "-5,90", "+120,00"];

const Words: React.FC<{ at: number; text: string; size: number; weight: number; color: string; accent?: { word: string; color: string } }> = ({
  at,
  text,
  size,
  weight,
  color,
  accent,
}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: SANS, fontSize: size, fontWeight: weight, letterSpacing: "-0.04em", lineHeight: 1.12, color }}>
      {words.map((w, i) => {
        const p = tw(f, at + i * 6, at + i * 6 + 20, 0, 1, OUT);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.26em",
              opacity: p,
              filter: `blur(${(1 - p) * 14}px)`,
              translate: `0 ${(1 - p) * 34}px`,
              color: accent && w.startsWith(accent.word) ? accent.color : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kinetic: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.typo;
  const L = useCopy().kinetic;
  const { w: W, h: H, v } = useStage();
  const why = tw(f, sec(a.why) + 6, sec(a.why) + 32, 0, 1, OUT);
  const dim = tw(f, sec(a.why) - 16, sec(a.why) + 2, 1, 0, INOUT);
  const ring = tw(f, sec(a.why), sec(a.why) + 60, 0, 1, OUT);

  return (
    <AbsoluteFill>
      <Backdrop intensity={0.6} />

      {/* les trades qu'on ne note pas : des chiffres qui défilent, sans histoire */}
      {NUMS.concat(NUMS).map((n, i) => {
        const speed = 0.5 + rand(i + 1) * 0.9;
        const y = ((rand(i + 20) * (H + 260) - f * speed) % (H + 260) + (H + 260)) % (H + 260) - 130;
        const x = rand(i + 40) * (W - 200) + 40;
        const neg = n.startsWith("-");
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 44 + rand(i) * 28,
              color: neg ? C.neg : C.pos,
              opacity: 0.1 * tw(f, 0, 30, 0, 1) * (1 - why * 0.6),
            }}
          >
            {n}
          </div>
        );
      })}

      <AbsoluteFill style={{ paddingLeft: v ? 70 : 170, paddingRight: v ? 50 : 0, justifyContent: "center", opacity: dim, filter: `blur(${(1 - dim) * 5}px)` }}>
        <Words at={sec(a.l1)} text={L.l1} size={v ? 66 : 96} weight={600} color={C.text2} />
        <Words at={sec(a.l2)} text={L.l2} size={v ? 100 : 150} weight={800} color={C.text} />
        <Words at={sec(a.l3)} text={L.l3} size={v ? 100 : 150} weight={800} color={C.text} accent={{ word: L.accent, color: C.neg }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 420 + ring * 1100,
            height: 420 + ring * 1100,
            borderRadius: "50%",
            border: `3px solid ${C.brand}`,
            opacity: (1 - ring) * 0.55 * (why > 0 ? 1 : 0),
          }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: v ? 190 : 330,
            whiteSpace: "nowrap",
            letterSpacing: "-0.055em",
            background: `linear-gradient(90deg, ${C.brand} 0%, #7cb0ff 55%, ${C.teal} 100%)`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            opacity: why,
            filter: `blur(${(1 - why) * 22}px)`,
            scale: String(0.92 + why * 0.08),
          }}
        >
          {L.why}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
