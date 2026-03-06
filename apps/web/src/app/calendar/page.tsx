"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

type Trade = {
  id: string;
  openedAt: string;
  netPnl: string | null;
};

type DaySummary = {
  date: string;
  pnl: number;
  trades: number;
};

function getPnlClass(value: number) {
  if (value > 0) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (value < 0) return "bg-rose-50 border-rose-200 text-rose-700";
  return "bg-slate-50 border-slate-200 text-slate-700";
}

export default function CalendarPage() {
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

  const daySummaries = useMemo<DaySummary[]>(() => {
    const map = new Map<string, DaySummary>();

    trades.forEach((trade) => {
      const date = new Date(trade.openedAt).toISOString().slice(0, 10);
      const pnl = Number(trade.netPnl ?? 0);
      const current = map.get(date);

      if (current) {
        current.pnl += pnl;
        current.trades += 1;
        return;
      }

      map.set(date, { date, pnl, trades: 1 });
    });

    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);
  }, [trades]);

  return (
    <DashboardShell title="Calendrier" subtitle="Performance journalière et rythme de trading">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {loading ? <p className="text-sm text-slate-500">Loading daily performance...</p> : null}

        {!loading && daySummaries.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            No trading days yet. Add trades to populate the calendar view.
          </p>
        ) : null}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {daySummaries.map((day) => (
            <article key={day.date} className={`rounded-xl border p-3 ${getPnlClass(day.pnl)}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.1em]">{new Date(day.date).toLocaleDateString()}</p>
              <p className="mt-2 text-lg font-semibold">
                {day.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm opacity-90">{day.trades} trade(s)</p>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
