// Écrans du téléphone, reconstruits fidèlement d'après l'app (libellés exacts de broker-connect-modal.tsx, resync-button.tsx,
// comptes/page.tsx et du dashboard). Chaque écran reçoit `f` (image locale du plan) et des progressions déjà calculées.
import React from "react";
import { C, SANS, MONO } from "../tokens";
import { DEMO, NET_PNL, TRADES } from "../data";
import { tw, OUT, INOUT, fmt } from "../motion";
import { SW, SH } from "./Phone";

// ── Coordonnées d'écran des zones qu'on touche (à calibrer sur les images clés) ───────────────────────────────────────────
export const TAP = {
  connect: { x: 195, y: 370 }, // « Connect cTrader for auto-sync »
  go: { x: 150, y: 543 }, // « Connect with cTrader » (dans le modal)
  allow: { x: 195, y: 392 }, // « Allow access » (page d'autorisation)
  done: { x: 195, y: 506 }, // « Done » (modal)
  dash: { x: 39, y: 782 }, // onglet Dashboard
};

const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.surface1, border: `1px solid ${C.border}`, borderRadius: 18, ...style }}>{children}</div>
);

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.text2, ...style }}>{children}</div>
);

const Pill: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ color, children, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: SANS, fontSize: 11, fontWeight: 700, color, background: `${color}1f`, borderRadius: 999, padding: "3px 9px", ...style }}>{children}</span>
);

// ── Barre d'onglets du bas ─────────────────────────────────────────────────────────────────────────────────────────────────
const NAV = ["Dashboard", "Journal", "Calendar", "Statistics", "More"] as const;
const icon = (name: (typeof NAV)[number], c: string) => {
  const p = { fill: "none", stroke: c, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "Dashboard":
      return (<svg width="24" height="24" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...p} /></svg>);
    case "Journal":
      return (<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" {...p} /></svg>);
    case "Calendar":
      return (<svg width="24" height="24" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3" {...p} /><path d="M3.5 10h17M8 3v4M16 3v4" {...p} /></svg>);
    case "Statistics":
      return (<svg width="24" height="24" viewBox="0 0 24 24"><rect x="4" y="12" width="4" height="8" rx="1.5" {...p} /><rect x="10" y="7" width="4" height="13" rx="1.5" {...p} /><rect x="16" y="3.5" width="4" height="16.5" rx="1.5" {...p} /></svg>);
    default:
      return (<svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" {...p} /></svg>);
  }
};

export const TabBar: React.FC<{ active: (typeof NAV)[number] }> = ({ active }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 92, background: "rgba(15,23,42,0.96)", borderTop: `1px solid ${C.border}`, display: "flex", paddingTop: 10, zIndex: 4 }}>
    {NAV.map((n) => (
      <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: SANS, fontSize: 11, fontWeight: 500, color: n === active ? C.brand : C.text2 }}>
        {icon(n, n === active ? C.brand : C.text2)}
        {n}
      </div>
    ))}
  </div>
);

// ── Écran « Accounts » ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const AccountsScreen: React.FC<{ synced: number; syncing: number; counter: number }> = ({ synced, syncing, counter }) => {
  const balance = DEMO.startBalance + NET_PNL * synced;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <div style={{ position: "absolute", left: 22, top: 62, fontFamily: SANS, fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>Accounts</div>
      <div style={{ position: "absolute", right: 20, top: 66, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: "7px 12px", background: C.surface1 }}>+ Add account</div>

      <Card style={{ position: "absolute", left: 16, right: 16, top: 118, padding: 16 }}>
        <Label>Trading Accounts</Label>
        <div style={{ marginTop: 12, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 600, color: C.text }}>{DEMO.accountName}</div>
              <div style={{ marginTop: 3, fontFamily: SANS, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text2 }}>Live</div>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.text, background: C.surface1, borderRadius: 999, padding: "4px 10px" }}>{DEMO.currency}</span>
          </div>

          {/* bloc solde : apparaît quand les trades sont importés */}
          <div style={{ overflow: "hidden", height: 74 * synced, opacity: synced, marginTop: synced > 0 ? 12 : 0 }}>
            <div style={{ background: C.surface1, borderRadius: 11, padding: 12, height: 62 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text2 }}>Balance</span>
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: C.pos }}>{fmt(balance)} {DEMO.currency}</span>
              </div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, color: C.text2 }}>
                <span>PnL: <span style={{ fontFamily: MONO, fontWeight: 700, color: C.pos }}>+{fmt(NET_PNL * synced)}</span></span>
                <span style={{ fontFamily: MONO, fontWeight: 700, color: C.pos }}>+{fmt((NET_PNL * synced) / (DEMO.startBalance / 100), 1)}%</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 13, color: C.text2, lineHeight: 1.7 }}>
            <div>Broker: cTrader</div>
            <div>Starting capital: {fmt(DEMO.startBalance)} {DEMO.currency}</div>
            <div>Created: 10/8/2026</div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <div style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface1, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text }}>Edit</div>
            <div style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", border: `1px solid ${C.neg}33`, borderRadius: 10, background: `${C.neg}0d`, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.neg }}>Delete</div>
          </div>

          {/* bouton de connexion -> section cTrader connecté */}
          <div style={{ position: "relative", marginTop: 12, height: 108 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 34, opacity: 1 - synced, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1.5px dashed ${C.border}`, borderRadius: 12, background: C.surface1, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.text2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.2 8.7a4.5 4.5 0 011.2 7.2l-4.5 4.5a4.5 4.5 0 01-6.4-6.4l1.8-1.8m13.3-.6l1.8-1.8a4.5 4.5 0 00-6.4-6.4l-4.5 4.5a4.5 4.5 0 001.2 7.2" /></svg>
              Connect cTrader for auto-sync
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: synced, translate: `0 ${(1 - synced) * 12}px` }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, background: C.surface1, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 12a8 8 0 01-13.7 5.6L4 15.3M20 4v5h-5M4 20v-5h5" /></svg>
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.text }}>cTrader</span>
                    <Pill color={C.pos} style={{ fontSize: 10, padding: "2px 7px" }}>LIVE</Pill>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.text2 }}>{syncing > 0.02 && syncing < 0.98 ? "Syncing..." : "Just now"}</span>
                </div>
                <div style={{ marginTop: 8, borderRadius: 9, background: `${C.pos}1a`, border: `1px solid ${C.pos}33`, padding: "6px 10px", fontFamily: SANS, fontSize: 12, color: C.pos }}>
                  {Math.round(TRADES * counter)} new trades imported
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <TabBar active="More" />
    </div>
  );
};

// ── Modal « Connect cTrader » (fidèle à broker-connect-modal.tsx) ─────────────────────────────────────────────────────────
export const ConnectModal: React.FC<{ show: number; step: "intro" | "linking" | "done"; stepT: number; spin: number }> = ({ show, step, stepT, spin }) => {
  const heights = { intro: 392, linking: 224, done: 322 };
  const h = heights[step];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, background: `rgba(15,23,42,${0.66 * show})`, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          top: SH / 2 - h / 2 - 8 + (1 - show) * 40,
          height: h,
          opacity: show,
          background: C.surface1,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: 20,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          fontFamily: SANS,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 12a8 8 0 01-13.7 5.6L4 15.3M20 4v5h-5M4 20v-5h5" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Connect cTrader</div>
              <div style={{ fontSize: 12, color: C.text2 }}>{DEMO.accountName}</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </div>

        {/* étape : intro */}
        <div style={{ position: "absolute", left: 20, right: 20, top: 80, opacity: step === "intro" ? 1 : 0 }}>
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, fontSize: 13, color: C.text2, lineHeight: 1.55 }}>
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>How it works</div>
            <div>1. Click <b style={{ color: C.text }}>Connect with cTrader</b> below</div>
            <div>2. Log in to your cTrader ID and grant access</div>
            <div>3. You’re redirected back here automatically</div>
            <div>4. Click <b style={{ color: C.text }}>Resync</b> on your account anytime to pull new trades</div>
            <div style={{ fontSize: 11.5, marginTop: 8 }}>Read-only access only. We never place orders or modify your account.</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <div style={{ flex: 1, height: 44, borderRadius: 12, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 600, color: "#fff", boxShadow: `0 0 ${24 * stepT}px ${C.brand}88` }}>Connect with cTrader</div>
            <div style={{ height: 44, padding: "0 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface1, display: "flex", alignItems: "center", fontSize: 13.5, fontWeight: 600, color: C.text }}>Cancel</div>
          </div>
        </div>

        {/* étape : linking */}
        <div style={{ position: "absolute", left: 20, right: 20, top: 100, opacity: step === "linking" ? 1 : 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${C.brand}`, borderTopColor: "transparent", rotate: `${spin}deg` }} />
          <div style={{ fontSize: 13.5, color: C.text2 }}>Linking your cTrader account...</div>
        </div>

        {/* étape : done */}
        <div style={{ position: "absolute", left: 20, right: 20, top: 84, opacity: step === "done" ? 1 : 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: `${C.pos}1a`, display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.8 + 0.2 * tw(stepT, 0, 1, 0, 1, OUT)) }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.pos} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 12.75l6 6 9-13.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tw(stepT, 0.1, 0.8, 0, 1, INOUT)} />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>cTrader connected!</div>
            <div style={{ marginTop: 6, fontSize: 13, color: C.text2, lineHeight: 1.5 }}>Use the <b>Resync</b> button on your account to pull the latest trades anytime.</div>
          </div>
          <div style={{ height: 40, padding: "0 24px", borderRadius: 12, background: C.brand, display: "flex", alignItems: "center", fontSize: 13.5, fontWeight: 600, color: "#fff" }}>Done</div>
        </div>
      </div>
    </div>
  );
};

// ── Page d'autorisation (côté cTrader : volontairement générique, sans logo ni habillage de marque) ──────────────────────
export const AuthScreen: React.FC<{ press: number }> = ({ press }) => (
  <div style={{ position: "absolute", inset: 0, background: "#0b1220", zIndex: 25, fontFamily: SANS }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, borderBottom: `1px solid ${C.border}`, fontSize: 12.5, color: C.text2 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.pos} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
      cTrader ID
    </div>
    <div style={{ position: "absolute", left: 28, right: 28, top: 140 }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, lineHeight: 1.15 }}>Authorize Bull &amp; Bear</div>
      <div style={{ marginTop: 10, fontSize: 14, color: C.text2, lineHeight: 1.5 }}>Signed in as <span style={{ color: C.text, fontWeight: 600 }}>trader@email.com</span></div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
        {["View your trading accounts", "Read your closed-trade history", "No orders. No changes to your account."].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14.5, color: C.text }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.pos}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.pos} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            {t}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, height: 50, borderRadius: 14, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", boxShadow: `0 0 ${28 * press}px ${C.brand}88` }}>Allow access</div>
      <div style={{ marginTop: 12, height: 50, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, color: C.text2 }}>Deny</div>
    </div>
  </div>
);

// ── Courbe de PnL cumulé : lissée (Catmull-Rom -> Bézier) ────────────────────────────────────────────────────────────────
type Pt = [number, number];
const segs = (pts: Pt[]) =>
  pts.slice(0, -1).map((p1, i) => {
    const p0 = pts[i - 1] ?? p1;
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    return { p1, p2, c1: [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6] as Pt, c2: [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6] as Pt };
  });
const toPath = (pts: Pt[]) => segs(pts).reduce((d, s) => `${d} C${s.c1[0]},${s.c1[1]} ${s.c2[0]},${s.c2[1]} ${s.p2[0]},${s.p2[1]}`, `M${pts[0][0]},${pts[0][1]}`);
const tipAt = (pts: Pt[], p: number): Pt => {
  const ss = segs(pts);
  const x = Math.min(0.9999, p) * ss.length;
  const i = Math.floor(x);
  const t = x - i;
  const s = ss[i];
  const u = 1 - t;
  const b = (k: 0 | 1) => u * u * u * s.p1[k] + 3 * u * u * t * s.c1[k] + 3 * u * t * t * s.c2[k] + t * t * t * s.p2[k];
  return [b(0), b(1)];
};

/** PnL cumulé interpolé à la progression p (0..1) sur les trades. */
export const cumulativeAt = (p: number) => {
  const a = DEMO.cumulative;
  const x = Math.min(1, Math.max(0, p)) * (a.length - 1);
  const i = Math.min(a.length - 2, Math.floor(x));
  return a[i] + (a[i + 1] - a[i]) * (x - i);
};

export const PnlChart: React.FC<{ p: number; width: number; height: number; big?: boolean }> = ({ p, width, height, big }) => {
  const a = DEMO.cumulative;
  const lo = -60;
  const hi = 700;
  const pad = { l: 34, r: 8, t: 10, b: 20 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const X = (i: number) => pad.l + (i / (a.length - 1)) * iw;
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * ih;
  const pts: Pt[] = a.map((v, i) => [X(i), Y(v)]);
  const d = toPath(pts);
  const tip = tipAt(pts, p);
  const visible = Math.floor(p * (a.length - 1) + 0.0001);
  const id = `clip-${width}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={id}><rect x={0} y={-20} width={pad.l + p * iw} height={height + 40} /></clipPath>
        <linearGradient id={`g-${width}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.pos} stopOpacity="0.38" /><stop offset="1" stopColor={C.pos} stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 200, 400, 600].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={width - pad.r} y1={Y(v)} y2={Y(v)} stroke={C.border} strokeOpacity={v === 0 ? 0.9 : 0.4} strokeDasharray={v === 0 ? "4 4" : undefined} />
          <text x={pad.l - 6} y={Y(v) + 3.5} textAnchor="end" fontFamily={MONO} fontSize={9} fill={C.text2}>{v}</text>
        </g>
      ))}
      {["09/10", "09/18", "09/26", "10/04"].map((t, i) => (
        <text key={t} x={pad.l + (i / 3) * iw} y={height - 4} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.text2}>{t}</text>
      ))}
      <g clipPath={`url(#${id})`}>
        <path d={`${d} L${X(a.length - 1)},${Y(lo)} L${X(0)},${Y(lo)} Z`} fill={`url(#g-${width})`} />
        <path d={d} fill="none" stroke={C.pos} strokeWidth={big ? 3.2 : 2.6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${C.pos}aa)` }} />
        {pts.slice(0, visible + 1).map((q, i) => (
          <circle key={i} cx={q[0]} cy={q[1]} r={3} fill={C.surface1} stroke={C.pos} strokeWidth={1.6} />
        ))}
      </g>
      {p > 0 && <circle cx={tip[0]} cy={tip[1]} r={6.5} fill={C.pos} stroke="#d1fae5" strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${C.pos})` }} />}
    </svg>
  );
};

// ── Écran « Dashboard » ────────────────────────────────────────────────────────────────────────────────────────────────────
export const DashboardScreen: React.FC<{ p: number; enter: number }> = ({ p, enter }) => {
  const cum = cumulativeAt(p);
  const balance = DEMO.startBalance + cum;
  const pct = (cum / DEMO.startBalance) * 100;
  const wr = DEMO.winRate * Math.min(1, p * 1.2);
  const pf = 1 + (DEMO.profitFactor - 1) * Math.min(1, p * 1.1);
  const R = 34;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: enter, translate: `0 ${(1 - enter) * 24}px` }}>
      <div style={{ position: "absolute", left: 20, top: 60, fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: C.text }}>Dashboard</div>
      <div style={{ position: "absolute", right: 16, top: 62, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.text, border: `1px solid ${C.border}`, borderRadius: 999, padding: "7px 13px", background: C.surface1 }}>{DEMO.accountName} · 10.6K</div>

      <div style={{ position: "absolute", left: 16, right: 16, top: 112, height: 40, border: `1px solid ${C.border}`, borderRadius: 999, padding: 4, display: "flex", background: C.surface1 }}>
        {["7D", "30D", "YTD", "ALL"].map((t) => (
          <div key={t} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontFamily: SANS, fontSize: 12.5, fontWeight: 700, background: t === "30D" ? C.brand : "transparent", color: t === "30D" ? "#fff" : C.text2 }}>{t}</div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 16, right: 16, top: 168, display: "flex", gap: 12 }}>
        <Card style={{ flex: 1, padding: 14, height: 112 }}>
          <Label>Net PnL</Label>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.pos, letterSpacing: "-0.03em" }}>+{fmt(cum)}<span style={{ fontSize: 13, marginLeft: 4 }}>EUR</span></div>
          <Pill color={C.pos} style={{ marginTop: 8 }}>▲ PROFIT</Pill>
        </Card>
        <Card style={{ flex: 1, padding: 14, height: 112 }}>
          <Label>Account balance</Label>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{fmt(balance)}<span style={{ fontSize: 12, marginLeft: 4 }}>EUR</span></div>
          <Pill color={C.pos} style={{ marginTop: 8 }}>▲ +{fmt(pct, 1)}%</Pill>
        </Card>
      </div>

      <Card style={{ position: "absolute", left: 16, right: 16, top: 296, padding: 16, height: 286 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: C.text, textTransform: "uppercase" }}>Cumulative PnL</div>
            <div style={{ marginTop: 3, fontFamily: SANS, fontSize: 11, color: C.text2 }}>{TRADES} trades · 30D</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, color: C.text2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.pos }} />
            <span style={{ fontFamily: SANS }}>Cumulative</span>
            <span style={{ fontWeight: 700, color: C.pos }}>+{fmt(cum)}</span>
          </div>
        </div>
        <div style={{ marginTop: 8, borderRadius: 12, background: C.surface2, padding: "10px 6px 4px 4px" }}>
          <PnlChart p={p} width={326} height={196} />
        </div>
      </Card>

      <div style={{ position: "absolute", left: 16, right: 16, top: 598, display: "flex", gap: 12 }}>
        <Card style={{ flex: 1, padding: 14, height: 132 }}>
          <Label>Win rate</Label>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center", position: "relative" }}>
            <svg width="86" height="86" viewBox="0 0 86 86">
              <circle cx="43" cy="43" r={R} fill="none" stroke={C.surface2} strokeWidth="8" />
              <circle cx="43" cy="43" r={R} fill="none" stroke={C.brand} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(wr / 100) * circ} ${circ}`} transform="rotate(-90 43 43)" />
            </svg>
            <div style={{ position: "absolute", top: 27, fontFamily: MONO, fontWeight: 700, fontSize: 17, color: C.text }}>{Math.round(wr)}%</div>
          </div>
        </Card>
        <Card style={{ flex: 1, padding: 14, height: 132 }}>
          <Label>Profit factor</Label>
          <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.pos, letterSpacing: "-0.03em" }}>{fmt(pf)}</div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: C.surface2 }}>
            <div style={{ width: `${Math.min(100, (pf / 3) * 100)}%`, height: 6, borderRadius: 3, background: C.pos }} />
          </div>
          <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 11, color: C.text2 }}>Target ≥ 1.5</div>
        </Card>
      </div>
      <TabBar active="Dashboard" />
    </div>
  );
};

export { SW, SH };
