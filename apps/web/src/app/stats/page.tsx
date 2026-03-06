"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

type Trade = {
  id: string;
  status: string;
  netPnl: string | null;
  side: "LONG" | "SHORT";
};

export default function StatsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    function syncAccountFromUrl() {
      const accountIdFromQuery = new URLSearchParams(window.location.search).get("accountId");
      setSelectedAccountId(accountIdFromQuery ?? "");
    }

    syncAccountFromUrl();
    window.addEventListener("bb-account-change", syncAccountFromUrl);
    window.addEventListener("popstate", syncAccountFromUrl);

    return () => {
      window.removeEventListener("bb-account-change", syncAccountFromUrl);
      window.removeEventListener("popstate", syncAccountFromUrl);
    };
  }, []);

  const tradesEndpoint = useMemo(() => {
    if (!selectedAccountId) {
      return null;
    }

    return `/api/trades?accountId=${encodeURIComponent(selectedAccountId)}`;
  }, [selectedAccountId]);

  useEffect(() => {
    async function loadTrades() {
      if (!tradesEndpoint) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(tradesEndpoint);
        const payload = (await response.json()) as { trades?: Trade[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load trades");
        }

        setTrades(payload.trades ?? []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadTrades();
  }, [tradesEndpoint]);

  const metrics = useMemo(() => {
    const total = trades.length;
    const closed = trades.filter((trade) => trade.status === "CLOSED");
    const winners = closed.filter((trade) => Number(trade.netPnl ?? 0) > 0);
    const losers = closed.filter((trade) => Number(trade.netPnl ?? 0) < 0);
    const net = closed.reduce((sum, trade) => sum + Number(trade.netPnl ?? 0), 0);
    const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0;

    return {
      total,
      closed: closed.length,
      winners: winners.length,
      losers: losers.length,
      net,
      winRate,
    };
  }, [trades]);

  return (
    <DashboardShell title="Statistiques" subtitle="Vue synthétique de performance basée sur les trades saisis">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {error ? (
          <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Trades total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{loading ? "..." : metrics.total}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Trades fermés</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{loading ? "..." : metrics.closed}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Win rate</p>
          <div className="mt-3 flex items-center justify-center">
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90 transform">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-slate-200"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(metrics.winRate / 100) * 289.03} 289.03`}
                  className="text-emerald-600 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {loading ? "..." : `${metrics.winRate.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Trades gagnants</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{loading ? "..." : metrics.winners}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Trades perdants</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{loading ? "..." : metrics.losers}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Net PnL (raw)</p>
          <p className={`mt-2 text-3xl font-semibold ${metrics.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {loading ? "..." : metrics.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </article>
      </div>
    </DashboardShell>
  );
}
