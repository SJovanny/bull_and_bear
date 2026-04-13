"use client";

import { MetricLabel } from "@/components/metric-label";
import { formatNumber, pnlColorClass } from "@/lib/format";

type KpiCardsProps = {
  loading: boolean;
  totalNetPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  currency?: string;
  currentBalance: number | null;
  returnPercent: number | null;
  maxDrawdownPercent: number | null;
};

export function KpiCards({
  loading,
  totalNetPnl,
  winRate,
  profitFactor,
  totalTrades,
  openTrades,
  closedTrades,
  currency = "USD",
  currentBalance,
  returnPercent,
  maxDrawdownPercent,
}: KpiCardsProps) {
  const hasBalance = currentBalance !== null;
  const featuredValueClassName = "mt-3 text-[clamp(1.15rem,1.45vw,1.55rem)] font-black tabular-nums leading-tight tracking-tight font-mono";
  const valueClassName = "mt-3 text-[clamp(1.35rem,1.9vw,1.9rem)] font-black tabular-nums leading-tight tracking-tight font-mono";
  const splitValueClassName = "text-[clamp(1.2rem,1.6vw,1.65rem)] font-black tabular-nums leading-none tracking-tight font-mono";

  return (
    <section className={`grid gap-3 sm:grid-cols-2 ${hasBalance ? "xl:grid-cols-6" : "xl:grid-cols-5"}`}>
      {/* Account Balance — only shown when initialBalance is set */}
      {hasBalance ? (
        <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] group transition-all hover:shadow-none border border-[#2e2e2e]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
            <MetricLabel
              label="Account Balance"
              description="Current account value: initial balance plus total net PnL from all closed trades."
            />
          </div>
          <p className={`${featuredValueClassName} break-words text-primary`}>
            {loading ? (
              <span className="text-secondary">—</span>
            ) : (
              <>
                <span>{formatNumber(currentBalance)}</span>
                <span className="ml-1 text-sm font-bold uppercase tracking-[0.16em] text-secondary font-sans sm:text-base">
                  {currency}
                </span>
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {returnPercent !== null ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide font-sans ${
                  returnPercent >= 0
                    ? "bg-pnl-positive/10 text-pnl-positive"
                    : "bg-pnl-negative/10 text-pnl-negative"
                }`}
              >
                <span>{returnPercent >= 0 ? "▲" : "▼"}</span>
                <span>{returnPercent >= 0 ? "+" : ""}{formatNumber(returnPercent, 1)}%</span>
              </span>
            ) : null}
            {maxDrawdownPercent !== null && maxDrawdownPercent > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-pnl-negative/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pnl-negative font-sans">
                DD {formatNumber(maxDrawdownPercent, 1)}%
              </span>
            ) : null}
          </div>
        </article>
      ) : null}

      {/* Net PnL — featured card */}
      <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] group transition-all hover:shadow-none border border-[#2e2e2e]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
          <MetricLabel
            label="Net PnL"
            description="Total net profit or loss on closed trades for the selected period."
          />
        </div>
        <p className={`${featuredValueClassName} break-words ${pnlColorClass(totalNetPnl)}`}>
          {loading ? (
            <span className="text-secondary">—</span>
          ) : (
            <>
              <span>{totalNetPnl > 0 ? "+" : ""}{formatNumber(totalNetPnl)}</span>
              <span className="ml-1 text-sm font-bold uppercase tracking-[0.16em] text-secondary font-sans sm:text-base">
                {currency}
              </span>
            </>
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
      <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] transition-all hover:shadow-none border border-[#2e2e2e]">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
          <MetricLabel
            label="Win Rate"
            description="Percentage of closed trades that finished positive."
          />
        </div>
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
      <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] transition-all hover:shadow-none border border-[#2e2e2e]">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
          <MetricLabel
            label="Profit Factor"
            description="Gross profits divided by gross losses. Above 1 means gains outweigh losses overall."
          />
        </div>
        <p className={`${valueClassName} ${profitFactor >= 1 ? "text-pnl-positive" : "text-pnl-negative"}`}>
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
      <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] transition-all hover:shadow-none border border-[#2e2e2e]">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
          <MetricLabel
            label="Total Trades"
            description="All trades opened in the selected range, including open and closed positions."
          />
        </div>
        <p className={`${valueClassName} text-primary`}>
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
      <article className="relative rounded-2xl border border-[#2e2e2e] bg-surface-1 p-5 shadow-none border border-[#2e2e2e] transition-all hover:shadow-none border border-[#2e2e2e]">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary font-sans">
          <MetricLabel
            label="Open / Closed"
            description="Current split between active positions and trades already closed in the selected period."
          />
        </div>
        <div className="mt-3 flex items-end gap-3">
          <div>
            <p className={`${splitValueClassName} text-amber-500`}>
              {loading ? "—" : openTrades}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary font-sans">Open</p>
          </div>
          <span className="mb-5 text-xl font-light text-border">/</span>
          <div>
            <p className={`${splitValueClassName} text-primary`}>
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
