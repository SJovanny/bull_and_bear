// Chapitre 6 : le dashboard se décompose en calques 3D (découpés dans la vraie capture de l'app).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw } from "../motion";
import { Backdrop } from "../ui/Backdrop";

const IMG = { w: 1162, h: 842, src: "brand/dashboard_example.png" };
const SCALE = 0.82;

// zones découpées dans la capture (x, y, largeur, hauteur) et libellés
const LAYERS = [
  { id: "calendar", side: "right", x: 330, y: 572, w: 828, h: 270 },
  { id: "trades", side: "left", x: 5, y: 572, w: 318, h: 270 },
  { id: "daily", side: "right", x: 587, y: 215, w: 571, h: 345 },
  { id: "curve", side: "left", x: 5, y: 215, w: 570, h: 345 },
  { id: "kpi", side: "right", x: 5, y: 58, w: 1153, h: 147 },
] as const;

// projection d'un point du conteneur 3D vers l'écran (mêmes transformations que le CSS : scale, rotateZ, rotateX, perspective)
const ORIGIN = { x: 1090, y: 640 };
const PERSPECTIVE = 2600;
const project = (px: number, py: number, pz: number, rx: number, rz: number, s: number) => {
  const a = (rz * Math.PI) / 180;
  const b = (rx * Math.PI) / 180;
  const x1 = px * s;
  const y1 = py * s;
  const x2 = x1 * Math.cos(a) - y1 * Math.sin(a);
  const y2 = x1 * Math.sin(a) + y1 * Math.cos(a);
  const y3 = y2 * Math.cos(b) - pz * Math.sin(b);
  const z3 = y2 * Math.sin(b) + pz * Math.cos(b);
  const k = PERSPECTIVE / (PERSPECTIVE - z3);
  const cx = ORIGIN.x - 960;
  const cy = ORIGIN.y - 540;
  return { x: 960 + (cx + x2) * k, y: 540 + (cy + y3) * k };
};

export const Layers3D: React.FC = () => {
  const f = useCurrentFrame();
  const a = useTimings().A.calques;
  const L = useCopy().layers;
  const appear = tw(f, 0, 18, 0, 1, OUT);
  const e = tw(f, sec(a.split), sec(a.split) + 52, 0, 1, INOUT); // éclatement
  const rx = 0 + e * 54;
  const rz = -33 * e;
  const title = tw(f, 4, 26, 0, 1, OUT);

  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: 110, top: 92, fontFamily: SANS, fontWeight: 800, fontSize: 100, letterSpacing: "-0.045em", lineHeight: 1.02, color: C.text, opacity: title, translate: `0 ${(1 - title) * 30}px` }}>
        {L.title[0]}<br />
        <span style={{ background: `linear-gradient(90deg, ${C.brand}, ${C.teal})`, WebkitBackgroundClip: "text", color: "transparent" }}>{L.title[1]}</span>
      </div>

      <AbsoluteFill style={{ perspective: 2600 }}>
        <div style={{ position: "absolute", left: ORIGIN.x, top: ORIGIN.y, width: 0, height: 0, opacity: appear }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateZ(${rz}deg) scale(${1 - e * 0.04})` }}>
            {LAYERS.map((l, i) => {
              const z = e * i * 74;
              return (
                <div
                  key={l.id}
                  style={{
                    position: "absolute",
                    left: (l.x - IMG.w / 2) * SCALE,
                    top: (l.y - IMG.h / 2) * SCALE,
                    width: l.w * SCALE,
                    height: l.h * SCALE,
                    transform: `translateZ(${z}px)`,
                    borderRadius: 18 * SCALE,
                    overflow: "visible",
                    boxShadow: e > 0.05 ? `0 ${40 * e}px ${90 * e}px rgba(0,0,0,0.55), 0 0 0 ${1.5}px ${C.brand}${e > 0.5 ? "66" : "00"}` : undefined,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, borderRadius: 18 * SCALE, overflow: "hidden", background: C.bg }}>
                    <Img
                      src={staticFile(IMG.src)}
                      style={{ position: "absolute", left: -l.x * SCALE, top: -l.y * SCALE, width: IMG.w * SCALE, height: IMG.h * SCALE, maxWidth: "none" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      {LAYERS.map((l, i) => {
        const s = 1 - e * 0.04;
        const left = (l.x - IMG.w / 2) * SCALE;
        const top = (l.y - IMG.h / 2) * SCALE;
        const px = l.side === "right" ? left + l.w * SCALE : left;
        const pt = project(px, top + (l.h * SCALE) / 2, e * i * 74, rx, rz, s);
        const lp = tw(f, sec(a.labels) + i * 7, sec(a.labels) + i * 7 + 16, 0, 1, OUT) * e;
        const dir = l.side === "right" ? 1 : -1;
        return (
          <div key={l.id} style={{ position: "absolute", left: pt.x, top: pt.y, opacity: lp, fontFamily: SANS }}>
            <div style={{ position: "absolute", left: dir === 1 ? 0 : -46, top: -1.5, width: 46, height: 3, background: C.brand, opacity: 0.8 }} />
            <div
              style={{
                position: "absolute",
                top: -29,
                [dir === 1 ? "left" : "right"]: dir === 1 ? 54 : 54,
                whiteSpace: "nowrap",
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "-0.02em",
                color: C.text,
                background: `${C.surface1}ee`,
                border: `1.5px solid ${C.brand}88`,
                borderRadius: 14,
                padding: "6px 18px",
                translate: `${dir * (1 - lp) * 20}px 0`,
              }}
            >
              {L[l.id]}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
