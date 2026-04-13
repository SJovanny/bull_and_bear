"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { ImageLightbox } from "@/components/image-lightbox";
import { TradeChart } from "@/components/trade-chart";
import { TradeEntryModal } from "@/components/trade-entry-modal";
import { useTranslation } from "@/lib/i18n/context";
import { TranslationKeys } from "@/lib/i18n/types";

type Trade = {
  id: string;
  assetClass: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: string;
  entryPrice: string;
  initialStopLoss: string | null;
  initialTakeProfit: string | null;
  contractMultiplier: string;
  exitPrice: string | null;
  fees: string;
  openedAt: string;
  closedAt: string | null;
  status: string;
  tradeOutcome: "WIN" | "LOSS" | "BREAKEVEN" | null;
  setupName: string | null;
  entryTimeframe: string | null;
  higherTimeframeBias: string | null;
  strategyTag: string | null;
  entryReason: string | null;
  exitReason: string | null;
  emotionalState: string | null;
  executionRating: number | null;
  lessonLearned: string | null;
  chartScreenshots: string[] | null;
  confluences: string[] | null;
  planFollowed: boolean | null;
  notes: string | null;
  netPnl: string | null;
  riskAmount: string | null;
  accountId: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatNumber(value: string | null) {
  if (value == null) return "-";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPnl(value: string | null) {
  if (value == null) return "-";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  const sign = parsed > 0 ? "+" : "";
  return `${sign}${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function plainText(value: string | null) {
  return value?.trim() ? value : "-";
}

/* ------------------------------------------------------------------ */
/*  Badge helpers                                                     */
/* ------------------------------------------------------------------ */

function sideBadge(side: "LONG" | "SHORT") {
  const isLong = side === "LONG";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        isLong
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-rose-500/10 text-rose-600"
      }`}
    >
      {isLong && (
        <svg className="mr-1 h-3 w-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 6H2z" /></svg>
      )}
      {!isLong && (
        <svg className="mr-1 h-3 w-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 4h8z" /></svg>
      )}
      {side}
    </span>
  );
}

function outcomeBadge(outcome: "WIN" | "LOSS" | "BREAKEVEN" | null) {
  if (!outcome) return <span className="text-sm text-secondary">-</span>;
  const styles: Record<string, string> = {
    WIN: "bg-emerald-500/10 text-emerald-600",
    LOSS: "bg-rose-500/10 text-rose-600",
    BREAKEVEN: "bg-amber-500/10 text-amber-600",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles[outcome]}`}>
      {outcome}
    </span>
  );
}

function statusBadge(status: string) {
  const isOpen = status === "OPEN";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        isOpen ? "bg-blue-500/10 text-blue-600" : "bg-slate-500/10 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-blue-500 animate-pulse" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Small reusable UI pieces                                          */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
      {children}
    </h3>
  );
}

function InfoCard({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#2e2e2e] bg-surface-1 p-4 transition-all hover:shadow-none border border-[#2e2e2e] ${className ?? ""}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function InfoValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-lg font-semibold text-primary font-mono ${className ?? ""}`}>{children}</p>;
}

function TextBlock({ label, value }: { label: string; value: string | null }) {
  const text = plainText(value);
  return (
    <div className="rounded-xl border border-[#2e2e2e] bg-surface-1 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-primary/80">{text}</p>
    </div>
  );
}

function ExecutionRatingBar({ rating }: { rating: number | null }) {
  if (rating == null) return <InfoValue>-</InfoValue>;
  const pct = (rating / 10) * 100;
  const color =
    rating >= 7 ? "bg-emerald-500" : rating >= 4 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="space-y-1.5">
      <p className="text-lg font-semibold text-primary font-mono">{rating}/10</p>
      <div className="h-2 w-full rounded-full bg-surface-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PlanFollowedIndicator({ followed, t }: { followed: boolean | null; t: (key: keyof TranslationKeys) => string }) {
  if (followed == null) return <InfoValue>-</InfoValue>;
  return (
    <div className="flex items-center gap-2">
      {followed ? (
        <>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
            <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
          </span>
          <span className="text-base font-semibold text-emerald-600">{t("tradeDetail.yes")}</span>
        </>
      ) : (
        <>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10">
            <svg className="h-4 w-4 text-rose-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </span>
          <span className="text-base font-semibold text-rose-600">{t("tradeDetail.no")}</span>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screenshot thumbnail grid                                         */
/* ------------------------------------------------------------------ */

function ScreenshotGrid({ screenshots, onClickImage, t }: { screenshots: string[]; onClickImage: (index: number) => void; t: (key: keyof TranslationKeys) => string }) {
  if (screenshots.length === 0) {
    return <p className="text-sm text-secondary">{t("tradeDetail.noScreenshots")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {screenshots.map((url, index) => (
        <button
          key={`${url}-${index}`}
          type="button"
          onClick={() => onClickImage(index)}
          className="group relative aspect-video w-full overflow-hidden rounded-xl border border-[#2e2e2e] bg-surface-2 transition-all hover:border-brand-500/40 hover:shadow-none border border-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Chart screenshot ${index + 1}`}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c]/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <svg className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="9" r="6" />
                <path d="M13.5 13.5L17 17" />
                <path d="M9 7v4M7 9h4" />
              </svg>
            </span>
          </div>
          {/* Label */}
          <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Screenshot {index + 1}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function TradeDetailPage() {
  const { t } = useTranslation();

  const params = useParams<{ id: string }>();
  const tradeId = params.id;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const screenshots = useMemo(() => {
    if (!trade?.chartScreenshots || !Array.isArray(trade.chartScreenshots)) {
      return [];
    }
    return trade.chartScreenshots.filter((item) => typeof item === "string" && item.trim().length > 0);
  }, [trade]);

  const loadTrade = useCallback(async () => {
    if (!tradeId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trades/${tradeId}`);
      const payload = (await response.json()) as { trade?: Trade; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load trade details");
      }
      setTrade(payload.trade ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    if (tradeId) loadTrade();
  }, [tradeId, loadTrade]);

  const pnlValue = Number(trade?.netPnl ?? 0);
  const pnlColor = pnlValue > 0 ? "text-pnl-positive" : pnlValue < 0 ? "text-pnl-negative" : "text-pnl-neutral";

  return (
    <DashboardShell
      title={t("tradeDetail.title")}
      subtitle={t("tradeDetail.subtitle")}
      actions={
        <>
          <Link
            href="/journal"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2e2e2e] px-3 text-sm font-medium text-secondary hover:bg-surface-2 transition-colors"
          >
            {t("tradeDetail.backJournal")}
          </Link>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 text-sm font-medium text-brand-600 hover:bg-brand-500/10 transition-colors"
          >
            {t("tradeDetail.editTrade")}
          </button>
        </>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          </div>
        )}
        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {!loading && !error && !trade && <p className="text-sm text-secondary">{t("tradeDetail.notFound")}</p>}

        {trade && (
          <>
            {/* ====================================================== */}
            {/*  HERO BANNER                                            */}
            {/* ====================================================== */}
            <section className="rounded-2xl border border-[#2e2e2e] bg-surface-1 p-6 shadow-none border border-[#2e2e2e] sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Symbol + metadata badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-primary">{trade.symbol}</h2>
                    {sideBadge(trade.side)}
                    {statusBadge(trade.status)}
                    {outcomeBadge(trade.tradeOutcome)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary">
                    <span>{trade.assetClass}</span>
                    <span className="text-border">|</span>
                    <span>{t("tradeDetail.openedOn")} {new Date(trade.openedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {trade.closedAt && (
                      <>
                        <span className="text-border">|</span>
                        <span>{t("tradeDetail.closedOn")} {new Date(trade.closedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: PnL big */}
                <div className="flex flex-col items-end">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">Net PnL</p>
                  <p className={`text-4xl font-bold font-mono tracking-tight ${pnlColor}`}>
                    {formatPnl(trade.netPnl)}
                  </p>
                </div>
              </div>
            </section>

            {/* ====================================================== */}
            {/*  EXECUTION                                              */}
            {/* ====================================================== */}
            <section className="space-y-3">
              <SectionTitle>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14l4-4m0 0l2-6 2 6m-4 0h4m2 4V4" /></svg>
                {t("tradeDetail.execution")}
              </SectionTitle>

              {/* Two‑column: info cards LEFT, chart RIGHT */}
              <div className="grid gap-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
                {/* Left column — compact info cards */}
                <div className="grid grid-cols-2 gap-2 self-start">
                  <InfoCard label={t("tradeDetail.entryPrice")}>
                    <InfoValue>{formatNumber(trade.entryPrice)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.exitPrice")}>
                    <InfoValue>{formatNumber(trade.exitPrice)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.quantity")}>
                    <InfoValue>{formatNumber(trade.quantity)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.fees")}>
                    <InfoValue>{formatNumber(trade.fees)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.stopLoss")}>
                    <InfoValue>{formatNumber(trade.initialStopLoss)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.takeProfit")}>
                    <InfoValue>{formatNumber(trade.initialTakeProfit)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.riskAmount")}>
                    <InfoValue>{formatNumber(trade.riskAmount)}</InfoValue>
                  </InfoCard>
                  <InfoCard label={t("tradeDetail.contractMultiplier")}>
                    <InfoValue>{formatNumber(trade.contractMultiplier)}</InfoValue>
                  </InfoCard>
                </div>

                {/* Right column — TradingView chart */}
                <div className="min-w-0">
                  <TradeChart
                    symbol={trade.symbol}
                    assetClass={trade.assetClass}
                    interval={trade.entryTimeframe}
                    side={trade.side}
                    openedAt={trade.openedAt}
                    closedAt={trade.closedAt}                    entryPrice={trade.entryPrice}                    exitPrice={trade.exitPrice}                  />
                </div>
              </div>
            </section>

            {/* ====================================================== */}
            {/*  CONTEXTE & STRATEGIE                                   */}
            {/* ====================================================== */}
            <section className="space-y-3">
              <SectionTitle>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                {t("tradeDetail.contextStrategy")}
              </SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard label="Setup">
                  <p className="text-base font-semibold text-primary">{plainText(trade.setupName)}</p>
                </InfoCard>
                <InfoCard label="Entry timeframe">
                  <p className="text-base font-semibold text-primary">{plainText(trade.entryTimeframe)}</p>
                </InfoCard>
                <InfoCard label="HTF Bias">
                  <p className="text-base font-semibold text-primary">{plainText(trade.higherTimeframeBias)}</p>
                </InfoCard>
                <InfoCard label="Strategy tag">
                  <p className="text-base font-semibold text-primary">{plainText(trade.strategyTag)}</p>
                </InfoCard>
              </div>

              {/* Confluences */}
              <div className="rounded-xl border border-[#2e2e2e] bg-surface-1 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">{t("tradeDetail.confluences")}</p>
                {trade.confluences && trade.confluences.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trade.confluences.map((c, i) => (
                      <span
                        key={`${c}-${i}`}
                        className="inline-flex rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-secondary">-</p>
                )}
              </div>

              {/* Entry / Exit reason */}
              <div className="grid gap-3 sm:grid-cols-2">
                <TextBlock label={t("tradeDetail.entryReason")} value={trade.entryReason} />
                <TextBlock label={t("tradeDetail.exitReason")} value={trade.exitReason} />
              </div>
            </section>

            {/* ====================================================== */}
            {/*  ANALYSE & PSYCHOLOGIE                                  */}
            {/* ====================================================== */}
            <section className="space-y-3">
              <SectionTitle>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" /><path d="M5.5 9.5s1 1.5 2.5 1.5 2.5-1.5 2.5-1.5" /><circle cx="6" cy="6.5" r="0.5" fill="currentColor" /><circle cx="10" cy="6.5" r="0.5" fill="currentColor" /></svg>
                {t("tradeDetail.analysisPsychology")}
              </SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard label={t("tradeDetail.executionRating")}>
                  <ExecutionRatingBar rating={trade.executionRating} />
                </InfoCard>
                <InfoCard label={t("tradeDetail.planFollowed")}>
                  <PlanFollowedIndicator followed={trade.planFollowed} t={t} />
                </InfoCard>
                <InfoCard label={t("tradeDetail.emotionalState")}>
                  <p className="text-base font-semibold text-primary">{plainText(trade.emotionalState)}</p>
                </InfoCard>
              </div>
              <TextBlock label={t("tradeDetail.lessonLearned")} value={trade.lessonLearned} />
              <TextBlock label={t("tradeDetail.notes")} value={trade.notes} />
            </section>

            {/* ====================================================== */}
            {/*  CHART SCREENSHOTS                                      */}
            {/* ====================================================== */}
            <section className="space-y-3">
              <SectionTitle>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="2" /><path d="M2 10l3-3 2 2 4-4 3 3" /></svg>
                {t("tradeDetail.screenshots")}
              </SectionTitle>
              <ScreenshotGrid
                screenshots={screenshots}
                t={t}
                onClickImage={(index) => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              />
            </section>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <ImageLightbox
          images={screenshots}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Edit modal */}
      {trade && (
        <TradeEntryModal
          isOpen={isEditOpen}
          initialDate={trade.openedAt.slice(0, 10)}
          mode="edit"
          tradeId={trade.id}
          initialTrade={{
            accountId: trade.accountId,
            assetClass: trade.assetClass as never,
            symbol: trade.symbol,
            side: trade.side,
            quantity: trade.quantity,
            openedAt: trade.openedAt,
            entryPrice: trade.entryPrice,
            initialStopLoss: trade.initialStopLoss,
            initialTakeProfit: trade.initialTakeProfit,
            riskAmount: trade.riskAmount,
            contractMultiplier: trade.contractMultiplier,
            status: trade.status === "CLOSED" ? "CLOSED" : "OPEN",
            closedAt: trade.closedAt,
            exitPrice: trade.exitPrice,
            fees: trade.fees,
            netPnl: trade.netPnl,
            setupName: trade.setupName,
            entryTimeframe: trade.entryTimeframe,
            higherTimeframeBias: trade.higherTimeframeBias,
            strategyTag: trade.strategyTag,
            confluences: trade.confluences,
            emotionalState: trade.emotionalState,
            executionRating: trade.executionRating,
            planFollowed: trade.planFollowed,
            entryReason: trade.entryReason,
            exitReason: trade.exitReason,
            lessonLearned: trade.lessonLearned,
            chartScreenshots: trade.chartScreenshots,
            notes: trade.notes,
          }}
          onClose={() => setIsEditOpen(false)}
          onSaved={loadTrade}
        />
      )}
    </DashboardShell>
  );
}
