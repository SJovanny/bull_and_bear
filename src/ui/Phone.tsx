// Coque de téléphone + doigt qui tape. Les coordonnées d'écran vont de (0,0) à (SW,SH) ; le centre de la coque est l'origine du repère caméra.
import React from "react";
import { C, SANS } from "../tokens";
import { tw, OUT } from "../motion";

export const SW = 390;
export const SH = 844;
const BEZEL = 12;

/** Point de l'écran -> repère centré sur la coque (pour la caméra). */
export const toCenter = (x: number, y: number) => ({ x: x - SW / 2, y: y - SH / 2 });

export const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 46, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 30px 0 34px", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text, zIndex: 5 }}>
    <span>9:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill={C.text} /><rect x="5" y="5" width="3" height="7" rx="1" fill={C.text} /><rect x="10" y="2" width="3" height="10" rx="1" fill={C.text} /><rect x="15" y="0" width="3" height="12" rx="1" fill={C.text} /></svg>
      <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={C.text} opacity="0.55" /><rect x="2" y="2" width="17" height="8" rx="2" fill={C.text} /><rect x="23.5" y="4" width="2" height="4" rx="1" fill={C.text} opacity="0.55" /></svg>
    </span>
  </div>
);

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: -(SW / 2 + BEZEL),
      top: -(SH / 2 + BEZEL),
      width: SW + BEZEL * 2,
      height: SH + BEZEL * 2,
      borderRadius: 58,
      background: "linear-gradient(145deg, #2b3547 0%, #0b1220 40%, #1c2536 100%)",
      boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 0 2px #3a475c inset, 0 0 90px rgba(59,130,246,0.18)",
    }}
  >
    <div style={{ position: "absolute", left: BEZEL, top: BEZEL, width: SW, height: SH, borderRadius: 46, overflow: "hidden", background: C.bg }}>
      {children}
      <StatusBar />
      {/* îlot dynamique */}
      <div style={{ position: "absolute", left: SW / 2 - 56, top: 10, width: 112, height: 31, borderRadius: 16, background: "#02050c", zIndex: 6 }} />
      {/* barre d'accueil */}
      <div style={{ position: "absolute", left: SW / 2 - 66, bottom: 8, width: 132, height: 5, borderRadius: 3, background: "rgba(229,231,235,0.55)", zIndex: 6 }} />
    </div>
  </div>
);

/** Appui du doigt à (x,y) d'écran, à l'image `at` : halo qui s'enfonce puis s'efface. */
export const Tap: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const appear = tw(f, at - 10, at, 0, 1, OUT);
  const press = tw(f, at, at + 5, 1, 0.82, OUT);
  const release = tw(f, at + 5, at + 12, 0, 1, OUT);
  const fade = tw(f, at + 14, at + 26, 1, 0);
  const ripple = tw(f, at, at + 22, 0, 1, OUT);
  const o = appear * fade;
  if (o <= 0) return null;
  const s = press + (1 - 0.82) * release * 0.4;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -30 - ripple * 22, top: -30 - ripple * 22, width: 60 + ripple * 44, height: 60 + ripple * 44, borderRadius: "50%", border: "2px solid rgba(229,231,235,0.7)", opacity: (1 - ripple) * o }} />
      <div style={{ position: "absolute", left: -24, top: -24, width: 48, height: 48, borderRadius: "50%", background: "rgba(229,231,235,0.34)", border: "2px solid rgba(229,231,235,0.85)", boxShadow: "0 6px 18px rgba(0,0,0,0.35)", opacity: o, scale: String(s) }} />
    </div>
  );
};
