"use client";

import { useEffect, useRef, useState } from "react";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";

type Connection = {
  id: string;
  syncStatus: "IDLE" | "SYNCING" | "ERROR";
  lastSyncAt: string | null;
};

type SyncResult = {
  imported: number;
  skipped: number;
} | null;

function formatLastSync(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function HeaderResyncButton() {
  const accountId = useSelectedAccountId();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult>(null);
  const [error, setError] = useState<string | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load connection whenever the selected account changes
  useEffect(() => {
    if (!accountId) {
      setConnection(null);
      return;
    }

    let cancelled = false;

    fetch(`/api/connections/ctrader/accounts?accountId=${encodeURIComponent(accountId)}`)
      .then((r) => r.json() as Promise<{ connection?: Connection | null }>)
      .then(({ connection: conn }) => {
        if (!cancelled) setConnection(conn ?? null);
      })
      .catch(() => {
        if (!cancelled) setConnection(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  // Also reload after a sync finishes (fires bb-accounts-changed)
  useEffect(() => {
    function handleAccountsChanged() {
      if (!accountId) return;
      fetch(`/api/connections/ctrader/accounts?accountId=${encodeURIComponent(accountId)}`)
        .then((r) => r.json() as Promise<{ connection?: Connection | null }>)
        .then(({ connection: conn }) => setConnection(conn ?? null))
        .catch(() => {});
    }
    window.addEventListener("bb-accounts-changed", handleAccountsChanged);
    return () => window.removeEventListener("bb-accounts-changed", handleAccountsChanged);
  }, [accountId]);

  async function handleResync() {
    if (!connection || isSyncing) return;

    setIsSyncing(true);
    setError(null);
    setResult(null);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

    try {
      const res = await fetch(`/api/connections/${connection.id}`, { method: "POST" });
      const data = (await res.json()) as {
        imported?: number;
        skipped?: number;
        error?: string;
        status?: string;
      };

      if (res.status === 409) {
        // Already syncing — just wait
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Sync failed");

      const syncResult = { imported: data.imported ?? 0, skipped: data.skipped ?? 0 };
      setResult(syncResult);
      setConnection((prev) => prev ? { ...prev, lastSyncAt: new Date().toISOString(), syncStatus: "IDLE" } : prev);

      // Notify other components that trades changed
      if (syncResult.imported > 0) {
        window.dispatchEvent(new CustomEvent("bb-trades-synced", { detail: syncResult }));
      }

      // Auto-dismiss result after 5s
      resultTimerRef.current = setTimeout(() => setResult(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  }

  // Don't render if no connection for this account
  if (!connection) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Result / error toast */}
      {result && !isSyncing && (
        <span className="hidden sm:inline text-xs font-medium text-pnl-positive font-sans">
          {result.imported > 0
            ? `+${result.imported} trade${result.imported === 1 ? "" : "s"}`
            : "Up to date"}
        </span>
      )}
      {error && (
        <span className="hidden sm:inline text-xs font-medium text-pnl-negative font-sans truncate max-w-[120px]">
          {error}
        </span>
      )}

      <button
        type="button"
        onClick={() => void handleResync()}
        disabled={isSyncing}
        title={
          isSyncing
            ? "Syncing with cTrader..."
            : connection.lastSyncAt
              ? `cTrader connected · Last sync: ${formatLastSync(connection.lastSyncAt)}`
              : "cTrader connected · Never synced"
        }
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-primary transition hover:border-brand-500 hover:text-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {/* cTrader dot indicator */}
        <span className={`h-1.5 w-1.5 rounded-full ${isSyncing ? "bg-amber-400 animate-pulse" : error ? "bg-pnl-negative" : "bg-pnl-positive"}`} />

        {/* Spin icon while syncing, refresh icon otherwise */}
        {isSyncing ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        )}

        <span className="hidden sm:inline">
          {isSyncing ? "Syncing..." : "Resync"}
        </span>
      </button>
    </div>
  );
}
