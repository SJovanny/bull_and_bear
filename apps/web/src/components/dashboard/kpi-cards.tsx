"use client";

import { formatNumber, pnlColorClass } from "@/lib/format";

type KpiCardsProps = {
  loading: boolean;
  totalNetPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
};

export function KpiCards({
  loading,
  totalNetPnl,
  winRate,
  profitFactor,
  totalTrades,
  openTrades,
  closedTrades,
}: KpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {/* Net PnL — featured card */}
      <article className="relative overflow-hidden rounded-2xl bg-surface-1 p-5 shadow-sm border border-border group transition-all hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">Net PnL</p>
        <p
          className={`mt-3 text-4xl font-black tabular-nums leading-none tracking-tight font-mono ${pnlColorClass(totalNetPnl)}`}
        >
          {loading ? (
            <span className="text-secondary">—</span>
          ) : (
            (totalNetPnl > 0 ? "+" : "") + formatNumber(totalNetPnl)
          )}
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide font-sans ${
            totalNetPnl >= 0
              ? "bg-pnl-positive/10 text-pnl-positive"
              : "bg-pnl-negative/10 text-pnl-negative"
          }`}
        >
          <span>{totalNetPnl >= 0 ? "▲" : "▼"}</span>
          <span>{totalNetPnl >= 0 ? "Profit" : "Loss"}</span>
        </div>
      </article>

      {/* Win Rate — circular gauge */}
      <article className="relative overflow-hidden rounded-2xl bg-surface-1 border border-border p-5 shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">Win Rate</p>
        <div className="mt-2 flex items-center justify-center">
          <div className="relative h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="23" stroke="currentColor" className="text-surface-2" strokeWidth="4.5" fill="none" />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke="currentColor"
                strokeWidth="4.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(winRate / 100) * 144.51} 144.51`}
                className="transition-all duration-700 text-brand-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <p className="text-2xl font-black tabular-nums leading-none text-primary font-mono">
                {loading ? "—" : `${formatNumber(winRate, 1)}%`}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-secondary font-sans">rate</p>
            </div>
          </div>
        </div>
      </article>

      {/* Profit Factor */}
      <article className="relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-5 shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">Profit Factor</p>
        <p
          className={`mt-3 text-4xl font-black tabular-nums leading-none tracking-tight font-mono ${
            profitFactor >= 1 ? "text-pnl-positive" : "text-pnl-negative"
          }`}
        >
          {loading ? "—" : Number.isFinite(profitFactor) ? formatNumber(profitFactor) : "∞"}
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              profitFactor >= 1 ? "bg-pnl-positive" : "bg-pnl-negative"
            }`}
            style={{ width: `${Math.min((profitFactor / 3) * 100, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-medium text-secondary font-sans">Target ≥ 1.5</p>
      </article>

      {/* Total Trades */}
      <article className="relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-5 shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">Total Trades</p>
        <p className="mt-3 text-4xl font-black tabular-nums leading-none tracking-tight text-primary font-mono">
          {loading ? "—" : totalTrades}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary font-sans">
            <span className="h-2 w-2 rounded-full bg-pnl-positive" />
            {closedTrades} closed
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary font-sans">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {openTrades} open
          </span>
        </div>
      </article>

      {/* Open / Closed */}
      <article className="relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-5 shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">Open / Closed</p>
        <div className="mt-3 flex items-end gap-3">
          <div>
            <p className="text-4xl font-black tabular-nums leading-none tracking-tight text-amber-500 font-mono">
              {loading ? "—" : openTrades}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary font-sans">Open</p>
          </div>
          <span className="mb-5 text-xl font-light text-border">/</span>
          <div>
            <p className="text-4xl font-black tabular-nums leading-none tracking-tight text-primary font-mono">
              {loading ? "—" : closedTrades}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary font-sans">Closed</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-700"
            style={{ width: totalTrades > 0 ? `${(openTrades / totalTrades) * 100}%` : "0%" }}
          />
        </div>
      </article>
    </section>
  );
}