import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, W, H } from "../tokens";

/** Fond commun : bleu nuit de l'app + halos très lents (aucun clignotement). */
export const Backdrop: React.FC<{ tint?: "blue" | "green" | "neutral"; intensity?: number }> = ({ tint = "blue", intensity = 1 }) => {
  const f = useCurrentFrame();
  const a = tint === "green" ? C.pos : tint === "neutral" ? C.text2 : C.brand;
  const b = C.teal;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #15213b 0%, ${C.bg} 55%, ${C.bgDeep} 100%)` }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -260 + Math.sin(f / 150) * 60,
          top: -420 + Math.cos(f / 170) * 40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${a}33 0%, transparent 62%)`,
          opacity: 0.55 * intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          left: W - 760 + Math.cos(f / 160) * 70,
          top: H - 640 + Math.sin(f / 190) * 50,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${b}2e 0%, transparent 62%)`,
          opacity: 0.5 * intensity,
        }}
      />
    </AbsoluteFill>
  );
};
