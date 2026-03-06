"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { TradeEntryModal } from "@/components/trade-entry-modal";

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

function formatNumber(value: string | null) {
  if (value == null) {
    return "-";
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "-";
  }

  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function plainText(value: string | null) {
  return value?.trim() ? value : "-";
}

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const tradeId = params.id;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const screenshots = useMemo(() => {
    if (!trade?.chartScreenshots || !Array.isArray(trade.chartScreenshots)) {
      return [];
    }

    return trade.chartScreenshots.filter((item) => typeof item === "string" && item.trim().length > 0);
  }, [trade]);

  const loadTrade = useCallback(async () => {
    if (!tradeId) {
      return;
    }

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
    if (tradeId) {
      loadTrade();
    }
  }, [tradeId, loadTrade]);

  return (
    <DashboardShell
      title="Detail du trade"
      subtitle="Execution, contexte et post-analyse du trade"
      actions={
        <>
          <Link
            href="/journal"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Retour journal
          </Link>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-cyan-300 px-3 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
          >
            Modifier le trade
          </button>
          <Link
            href="/journal"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Ajouter depuis journal
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {loading ? <p className="text-sm text-slate-500">Loading trade...</p> : null}
        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        {!loading && !error && !trade ? <p className="text-sm text-slate-600">Trade introuvable.</p> : null}

        {trade ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Instrument</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{trade.symbol}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Asset class</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{trade.assetClass}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Direction</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{trade.side}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Statut</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{trade.status}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Trade outcome</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{trade.tradeOutcome ?? "-"}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Quantite</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.quantity)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Execution rating</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {trade.executionRating == null ? "-" : `${trade.executionRating}/10`}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Entry</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.entryPrice)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Exit</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.exitPrice)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Fees</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.fees)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Risk amount</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.riskAmount)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Initial Stop Loss</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.initialStopLoss)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Initial Take Profit</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.initialTakeProfit)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Contract multiplier</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatNumber(trade.contractMultiplier)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Plan followed</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {trade.planFollowed == null ? "-" : trade.planFollowed ? "OUI" : "NON"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Opened at</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {new Date(trade.openedAt).toLocaleString()}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Closed at</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {trade.closedAt ? new Date(trade.closedAt).toLocaleString() : "-"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Net PnL</p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    Number(trade.netPnl ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatNumber(trade.netPnl)}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Setup</p>
                <p className="mt-1 text-base font-medium text-slate-900">{plainText(trade.setupName)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Entry timeframe</p>
                <p className="mt-1 text-base font-medium text-slate-900">{plainText(trade.entryTimeframe)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Higher timeframe bias</p>
                <p className="mt-1 text-base font-medium text-slate-900">{plainText(trade.higherTimeframeBias)}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Strategy tag</p>
                <p className="mt-1 text-base font-medium text-slate-900">{plainText(trade.strategyTag)}</p>
              </article>
            </div>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Entry reason</p>
              <p className="mt-1 text-sm text-slate-700">{plainText(trade.entryReason)}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Exit reason</p>
              <p className="mt-1 text-sm text-slate-700">{plainText(trade.exitReason)}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Emotional state</p>
              <p className="mt-1 text-sm text-slate-700">{plainText(trade.emotionalState)}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Lesson learned</p>
              <p className="mt-1 text-sm text-slate-700">{plainText(trade.lessonLearned)}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-700">{plainText(trade.notes)}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Confluences</p>
              <p className="mt-1 text-sm text-slate-700">
                {trade.confluences && trade.confluences.length > 0 ? trade.confluences.join(", ") : "-"}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Chart screenshots</p>
              {screenshots.length === 0 ? (
                <p className="mt-1 text-sm text-slate-700">-</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {screenshots.map((url, index) => (
                    <li key={`${url}-${index}`}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-700 underline hover:text-sky-500"
                      >
                        Screenshot {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        ) : null}
      </div>

      {trade ? (
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
      ) : null}
    </DashboardShell>
  );
}
