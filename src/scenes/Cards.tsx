// Chapitre 7 : les fonctionnalités arrivent en cartes, une par phrase de la voix (captures réelles de l'app).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, tw } from "../motion";
import { Backdrop } from "../ui/Backdrop";

// crop = [x, y, largeur] dans la capture d'origine (iw × ih) ; la vignette affiche 820 × 250 px de cette zone
const CARDS = [
  { at: "c1", key: "journal", img: "brand/journal_example.png", iw: 1464, ih: 904, crop: [233, 640, 684], color: C.brand },
  { at: "c2", key: "chart", img: "brand/chart_example.png", iw: 1369, ih: 833, crop: [412, 548, 902], color: C.teal },
  { at: "c3", key: "calendar", img: "brand/dashboard_example.png", iw: 1162, ih: 842, crop: [330, 585, 828], color: C.pos },
  { at: "c4", key: "stats", img: "brand/stats_example.png", iw: 1398, ih: 848, crop: [48, 12, 840], color: C.warn },
] as const;

const CW = 820;
const CH = 410;
const POS = [
  [100, 62],
  [1000, 62],
  [100, 512],
  [1000, 512],
];

export const Cards: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.cartes;
  const L = useCopy().cards;
  return (
    <AbsoluteFill>
      <Backdrop tint="neutral" intensity={0.8} />
      {CARDS.map((c, i) => {
        const at = sec(a[c.at]);
        const p = tw(f, at, at + 26, 0, 1, OUT);
        const zoom = 1.0 + tw(f, at, at + 150, 0, 0.05, (n) => n);
        const [x, y] = POS[i];
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: CW,
              height: CH,
              borderRadius: 30,
              background: C.surface1,
              border: `1.5px solid ${C.border}`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 ${p > 0.9 ? 1 : 0}px ${c.color}`,
              overflow: "hidden",
              opacity: p,
              translate: `0 ${(1 - p) * 70}px`,
              scale: String(0.94 + p * 0.06),
              fontFamily: SANS,
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 250, overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
              {(() => {
                const k = CW / c.crop[2];
                return (
                  <Img
                    src={staticFile(c.img)}
                    style={{ position: "absolute", maxWidth: "none", width: c.iw * k, height: c.ih * k, left: -c.crop[0] * k, top: -c.crop[1] * k, scale: String(zoom), transformOrigin: `${c.crop[0] * k + CW / 2}px ${c.crop[1] * k + 125}px` }}
                  />
                );
              })()}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 55%, ${C.surface1} 100%)` }} />
            </div>
            <div style={{ position: "absolute", left: 32, right: 32, bottom: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: c.color, boxShadow: `0 0 16px ${c.color}` }} />
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.035em", color: C.text }}>{L[c.key][0]}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 500, color: C.text2, lineHeight: 1.25 }}>{L[c.key][1]}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
