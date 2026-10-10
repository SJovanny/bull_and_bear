// Chapitres 3 et 4 : un seul plan continu. Le téléphone apparaît, la caméra zoome dans l'écran, l'utilisateur connecte cTrader,
// ses trades arrivent, puis la courbe monte et le PnL grimpe. Les ancres de temps sont dans timings.ts (A.telephone).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, SANS, MONO, sec } from "../tokens";
import { useTimings, useCopy } from "../lang";
import { OUT, INOUT, tw, fmt } from "../motion";
import { Backdrop } from "../ui/Backdrop";
import { useStage } from "../stage";
import { PhoneFrame, Tap, SH } from "../ui/Phone";
import { AccountsScreen, AuthScreen, ConnectModal, DashboardScreen, TAP, cumulativeAt } from "../ui/PhoneScreens";

const Caption: React.FC<{ v: boolean; f: number; from: number; to: number; side: "left" | "right"; n?: string; title: string; sub?: string }> = ({ v, f, from, to, side, n, title, sub }) => {
  const p = tw(f, sec(from), sec(from) + 18, 0, 1, OUT) * (1 - tw(f, sec(to) - 14, sec(to), 0, 1));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: v ? 150 : 430,
        ...(v ? { left: 60, right: 60, padding: "26px 34px", borderRadius: 32, background: "rgba(10,16,32,0.8)", border: `1.5px solid ${C.border}` } : { [side]: 90, width: 340 }),
        textAlign: v ? "center" : side === "left" ? "left" : "right",
        opacity: p,
        translate: v ? `0 ${-(1 - p) * 40}px` : `${(side === "left" ? -1 : 1) * (1 - p) * 40}px 0`,
        fontFamily: SANS,
        zIndex: 30,
      }}
    >
      {n && (
        <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", background: `${C.brand}26`, border: `2px solid ${C.brand}`, color: C.brand, fontWeight: 800, fontSize: 28, marginBottom: 18 }}>{n}</div>
      )}
      <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.035em", color: C.text }}>{title}</div>
      {sub && <div style={{ marginTop: 14, fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: C.text2 }}>{sub}</div>}
    </div>
  );
};

export const PhoneScene: React.FC = () => {
  const f = useCurrentFrame();
  const { w, h, v } = useStage();
  const a = useTimings().A.telephone;
  const L = useCopy().phone;
  const S = (k: keyof typeof a) => sec(a[k]);

  // ── caméra : échelle + point visé (coordonnées d'écran du téléphone) ───────────────────────────────────────────────
  const T = [0, 1.0, 3.0, 4.0, 5.2, 5.8, 7.0, 7.6, 8.6, 9.2, 9.9, 10.5, 15.2, 17.0].map(sec);
  const s = interpolate(f, T, [1.05, 1.05, 1.9, 2.1, 2.1, 1.7, 1.7, 2.2, 2.2, 1.9, 1.7, 2.1, 2.2, 0.88], { extrapolateRight: "clamp", easing: INOUT });
  const fy = interpolate(f, T, [422, 422, 380, 400, 410, 380, 380, 410, 410, 400, 560, 375, 360, 422], { extrapolateRight: "clamp", easing: INOUT });

  const enter = tw(f, 0, sec(1.4), 0, 1, OUT);
  const rotY = tw(f, 0, sec(1.6), -24, -8, OUT) + tw(f, sec(1.0), sec(3.0), 0, 8, INOUT) + tw(f, S("zoomOut"), sec(17), 0, -9, INOUT);
  const rotX = tw(f, 0, sec(1.6), 9, 4, OUT) + tw(f, sec(1.0), sec(3.0), 0, -4, INOUT) + tw(f, S("zoomOut"), sec(17), 0, 3, INOUT);

  // ── états des écrans ─────────────────────────────────────────────────────────────────────────────────────────────
  const modalIn = tw(f, S("modal"), S("modal") + 14);
  const modalOut = tw(f, S("tapDone") + 8, S("tapDone") + 22);
  const modalShow = modalIn * (1 - modalOut);
  const step = f < S("linking") ? "intro" : f < S("done") ? "linking" : "done";
  const stepT = step === "intro" ? tw(f, S("tapGo") - 8, S("tapGo") + 4, 0, 1) : step === "done" ? tw(f, S("done"), S("done") + 30, 0, 1) : 0;
  const authIn = tw(f, S("auth"), S("auth") + 10);
  const authOut = tw(f, S("linking") - 4, S("linking") + 8);
  const authShow = authIn * (1 - authOut);
  const synced = tw(f, S("synced"), S("synced") + sec(0.9), 0, 1, OUT);
  const syncing = tw(f, S("synced"), S("synced") + sec(0.8), 0, 1, INOUT);
  const counter = tw(f, S("synced") + 4, S("synced") + sec(1.0), 0, 1, OUT);
  const dashEnter = tw(f, S("dash"), S("dash") + 14);
  const p = tw(f, S("chart"), S("chartEnd"), 0, 1, INOUT);
  const cum = cumulativeAt(p);

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div style={{ position: "absolute", left: w / 2, top: h / 2, width: 0, height: 0, transform: `scale(${s}) translate(0px, ${-(fy - SH / 2)}px)` }}>
          <div style={{ position: "absolute", left: -520, top: -520, width: 1040, height: 1040, borderRadius: "50%", background: `radial-gradient(circle, ${C.brand}40, transparent 62%)`, opacity: 0.8 * enter }} />
          <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`, opacity: enter, translate: `0 ${(1 - enter) * 70}px` }}>
            <PhoneFrame>
              <div style={{ position: "absolute", inset: 0, opacity: 1 - dashEnter }}>
                <AccountsScreen synced={synced} syncing={syncing} counter={counter} />
              </div>
              <DashboardScreen p={p} enter={dashEnter} />
              <ConnectModal show={modalShow} step={step} stepT={stepT} spin={f * 11} />
              <div style={{ position: "absolute", inset: 0, opacity: authShow, translate: `0 ${(1 - authIn) * 30}px`, pointerEvents: "none", zIndex: 25 }}>
                <AuthScreen press={tw(f, S("tapAllow") - 6, S("tapAllow") + 4)} />
              </div>
              <Tap f={f} at={S("tapConnect")} {...TAP.connect} />
              <Tap f={f} at={S("tapGo")} {...TAP.go} />
              <Tap f={f} at={S("tapAllow")} {...TAP.allow} />
              <Tap f={f} at={S("tapDone")} {...TAP.done} />
              <Tap f={f} at={S("tapDash")} {...TAP.dash} />
            </PhoneFrame>
          </div>
        </div>
      </AbsoluteFill>

      {/* légendes en marge du téléphone (en français : elles redisent la voix off) */}
      <Caption v={v} f={f} from={a.tapConnect - 0.4} to={a.tapGo - 0.1} side="left" n="1" title={L.c1[0]} sub={L.c1[1]} />
      <Caption v={v} f={f} from={a.auth + 0.1} to={a.linking} side="left" n="2" title={L.c2[0]} sub={L.c2[1]} />
      <Caption v={v} f={f} from={a.done + 0.3} to={a.tapDash - 0.2} side="left" n="3" title={L.c3[0]} sub={L.c3[1]} />
      <Caption v={v} f={f} from={a.chart + 0.2} to={a.zoomOut + 0.4} side="left" title={L.c4[0]} sub={L.c4[1]} />

      {/* le PnL, en grand, à droite du téléphone pendant que la courbe monte */}
      {(() => {
        const o = tw(f, S("chart"), S("chart") + 16) * (1 - tw(f, S("zoomOut") + 6, S("zoomOut") + 24));
        if (o <= 0) return null;
        return (
          <div style={{ position: "absolute", ...(v ? { left: 0, right: 0, bottom: 330, textAlign: "center", zIndex: 30, textShadow: "0 6px 40px rgba(0,0,0,0.9)" } : { right: 90, top: 380, width: 480, textAlign: "right" }), opacity: o, translate: v ? `0 ${(1 - o) * 40}px` : `${(1 - o) * 40}px 0`, fontFamily: SANS }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.text2 }}>{L.pnl}</div>
            <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 104, fontWeight: 700, letterSpacing: "-0.05em", color: C.pos, textShadow: `0 0 40px ${C.pos}66` }}>+{fmt(cum)}</div>
            <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.pos, opacity: 0.85 }}>EUR</div>
          </div>
        );
      })()}

    </AbsoluteFill>
  );
};
