// Chapitre « installer » : depuis le site, on installe Bull & Bear comme une appli (PWA) — le téléphone passe du navigateur à l'écran d'accueil,
// l'icône se pose. Le journal est toujours là, dans la poche. Temps (secondes locales) : A.installer dans timings.ts.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw } from "../motion";
import { Backdrop } from "../ui/Backdrop";
import { PhoneFrame, Tap, SW } from "../ui/Phone";
import { useStage } from "../stage";

const ICONS = [
  ["#334155", ""], ["#1d4ed8", ""], ["#be123c", ""], ["#0f766e", ""],
  ["#7c3aed", ""], ["#b45309", ""], ["#0369a1", ""], ["#4d7c0f", ""],
  ["#475569", ""], ["#a21caf", ""], ["#0e7490", ""], ["#9f1239", ""],
];

export const Install: React.FC = () => {
  const f = useCurrentFrame();
  const { w, h, v } = useStage();
  const a = useTimings().A.installer;
  const L = useCopy().install;

  const enter = tw(f, 0, sec(0.5), 0, 1, OUT);
  const btnPress = tw(f, sec(a.tap) - 4, sec(a.tap) + 4, 0, 1);
  const toHome = tw(f, sec(a.home), sec(a.home) + 10, 0, 1);
  const icon = tw(f, sec(a.icon), sec(a.icon) + 16, 0, 1, OUT);
  const ring = tw(f, sec(a.icon) + 6, sec(a.icon) + 34, 0, 1, OUT);
  const cap1 = tw(f, sec(a.cap1), sec(a.cap1) + 16, 0, 1, OUT) * (1 - tw(f, sec(a.cap2) - 6, sec(a.cap2), 0, 1));
  const cap2 = tw(f, sec(a.cap2), sec(a.cap2) + 16, 0, 1, OUT);
  const S = v ? 1.5 : 1.12;
  const glow = tw(f, sec(a.icon), sec(a.icon) + 40, 0, 1, INOUT);

  const Caption: React.FC<{ p: number; title: string; sub?: string; side: "left" | "right" }> = ({ p, title, sub, side }) =>
    p <= 0 ? null : (
      <div
        style={{
          position: "absolute",
          ...(v
            ? { left: 60, right: 60, top: 120, textAlign: "center" as const }
            : { top: h / 2 - 120, [side]: 130, width: 520, textAlign: side === "left" ? ("left" as const) : ("right" as const) }),
          opacity: p,
          translate: v ? `0 ${-(1 - p) * 30}px` : `${(side === "left" ? -1 : 1) * (1 - p) * 40}px 0`,
          fontFamily: SANS,
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: v ? 62 : 64, fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.035em", color: C.text }}>{title}</div>
        {sub && <div style={{ marginTop: 14, fontSize: v ? 32 : 30, fontWeight: 500, color: C.text2 }}>{sub}</div>}
      </div>
    );

  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: w / 2 - 520, top: h / 2 - 520, width: 1040, height: 1040, borderRadius: "50%", background: `radial-gradient(circle, ${C.brand}38, transparent 62%)`, opacity: 0.4 + 0.5 * glow }} />

      <div style={{ position: "absolute", left: w / 2, top: v ? h / 2 + 40 : h / 2, width: 0, height: 0, transform: `scale(${S})`, opacity: enter, translate: `0 ${(1 - enter) * 60}px` }}>
        <PhoneFrame>
          {/* navigateur : le site, avec le bouton « Installer l'application » */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toHome, background: C.bg, fontFamily: SANS }}>
            <div style={{ position: "absolute", left: 18, right: 18, top: 62, height: 40, borderRadius: 20, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>
              <span style={{ color: C.pos }}>●</span>
              {L.site}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
              <Img src={staticFile("brand/BB_mark.png")} style={{ width: 150, height: 75, objectFit: "contain" }} />
              <div style={{ marginTop: 14, fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", color: C.text }}>BULL &amp; BEAR</div>
            </div>
            <div style={{ position: "absolute", left: 24, right: 24, top: 360, borderRadius: 18, background: C.surface1, border: `1px solid ${C.border}`, padding: 18 }}>
              <div style={{ height: 10, width: "70%", borderRadius: 5, background: C.surface2 }} />
              <div style={{ marginTop: 10, height: 10, width: "90%", borderRadius: 5, background: C.surface2 }} />
              <div style={{ marginTop: 10, height: 10, width: "55%", borderRadius: 5, background: C.surface2 }} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: 520,
                height: 58,
                borderRadius: 16,
                background: C.brand,
                color: "#fff",
                fontWeight: 800,
                fontSize: 19,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${34 * btnPress}px ${C.brand}aa`,
                scale: String(1 - btnPress * 0.04),
              }}
            >
              {L.btn}
            </div>
            <Tap f={f} at={sec(a.tap)} x={SW / 2} y={549} />
          </div>

          {/* écran d'accueil : l'icône se pose */}
          <div style={{ position: "absolute", inset: 0, opacity: toHome, background: "linear-gradient(160deg, #1e3a8a 0%, #0f172a 55%, #134e4a 100%)", fontFamily: SANS }}>
            <div style={{ position: "absolute", left: 22, right: 22, top: 90, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 26, rowGap: 34 }}>
              {ICONS.map(([c], i) => (
                <div key={i} style={{ textAlign: "center", opacity: i === 5 ? 0.0 : 1 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, background: `${c}`, margin: "0 auto", opacity: 0.85 }} />
                  <div style={{ marginTop: 6, height: 7, width: 38, borderRadius: 4, background: "rgba(229,231,235,0.35)", margin: "6px auto 0" }} />
                </div>
              ))}
            </div>
            {/* l'icône Bull & Bear, à la place de la 6e case */}
            <div style={{ position: "absolute", left: 22 + (SW - 44 - 3 * 26) / 4 + 26, top: 90 + 62 + 6 + 7 + 34 - 0, width: (SW - 44 - 3 * 26) / 4, textAlign: "center", opacity: icon, scale: String(0.4 + icon * 0.6), translate: `0 ${(1 - icon) * -40}px` }}>
              <div style={{ position: "relative", width: 62, height: 62, margin: "0 auto", borderRadius: 16, background: "#0b1220", border: `1.5px solid ${C.border}`, boxShadow: `0 0 ${30 * glow}px ${C.brand}99`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Img src={staticFile("brand/BB_mark.png")} style={{ width: 54, height: 27, objectFit: "contain" }} />
                <div style={{ position: "absolute", inset: -6, borderRadius: 22, border: `2px solid ${C.brand}`, opacity: (1 - ring) * 0.8, scale: String(1 + ring * 0.5) }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: C.text }}>{L.app}</div>
            </div>
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 30, height: 78, borderRadius: 28, background: "rgba(229,231,235,0.14)" }} />
          </div>
        </PhoneFrame>
      </div>

      <Caption p={cap1} title={L.title} sub={L.sub} side="left" />
      <Caption p={cap2} title={L.always} side={v ? "left" : "right"} />
    </AbsoluteFill>
  );
};
