"use client";

import { useState } from "react";

export type BrokerConnection = {
  id: string;
  provider: string;
  ctidTraderAccountId: string;
  isLive: boolean;
  lastSyncAt: string | null;
  syncStatus: "IDLE" | "SYNCING" | "ERROR";
  syncError?: string | null;
};

type ResyncButtonProps = {
  connection: BrokerConnection;
  /** Called after a successful sync so the parent can refresh trade data */
  onSynced?: (result: { imported: number; skipped: number }) => void;
  /** Called when the user disconnects the broker */
  onDisconnected?: () => void;
};

function formatLastSync(iso: string | null): string {
  if (!iso) return "Never synced";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ResyncButton({ connection, onSynced, onDisconnected }: ResyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(connection.lastSyncAt);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SYNCING" | "ERROR">(connection.syncStatus);

  async function handleResync() {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus("SYNCING");
    setError(null);
    setSyncResult(null);

    try {
      const res = await fetch(`/api/connections/${connection.id}`, {
        method: "POST",
      });

      const data = (await res.json()) as {
        imported?: number;
        skipped?: number;
        errors?: unknown[];
        error?: string;
        status?: string;
      };

      if (res.status === 409) {
        // Already syncing
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Sync failed");
      }

      const result = { imported: data.imported ?? 0, skipped: data.skipped ?? 0 };
      setSyncResult(result);
      setSyncStatus("IDLE");
      setLastSyncAt(new Date().toISOString());
      onSynced?.(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setSyncStatus("ERROR");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (isDisconnecting) return;
    setIsDisconnecting(true);
    setError(null);

    try {
      const res = await fetch(`/api/connections/${connection.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not disconnect");
      }
      onDisconnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setIsDisconnecting(false);
    }
  }

  const isLiveLabel = connection.isLive ? "Live" : "Demo";
  const isLiveClass = connection.isLive
    ? "bg-pnl-positive/10 text-pnl-positive"
    : "bg-amber-500/10 text-amber-600";

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-1 p-3 space-y-3">
      {/* Connection badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 overflow-hidden">
            <img
              src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773440476/ctrader_logo_full_pwcbdz.png"
              alt="cTrader"
              className="h-4 w-4 object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-primary font-sans">cTrader</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${isLiveClass}`}>
              {isLiveLabel}
            </span>
            {syncStatus === "ERROR" && (
              <span className="rounded-full bg-pnl-negative/10 px-1.5 py-0.5 text-[10px] font-bold text-pnl-negative uppercase">
                Error
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] text-secondary font-mono tabular-nums">
          {isSyncing ? "Syncing..." : formatLastSync(lastSyncAt)}
        </span>
      </div>

      {/* Sync result toast */}
      {syncResult && !isSyncing && (
        <div className="rounded-lg bg-pnl-positive/10 border border-pnl-positive/20 px-2.5 py-1.5 text-xs text-pnl-positive font-sans">
          {syncResult.imported > 0
            ? `${syncResult.imported} new trade${syncResult.imported === 1 ? "" : "s"} imported`
            : "Already up to date"}
          {syncResult.skipped > 0 && `, ${syncResult.skipped} duplicate${syncResult.skipped === 1 ? "" : "s"} skipped`}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-pnl-negative/10 border border-pnl-negative/20 px-2.5 py-1.5 text-xs text-pnl-negative font-sans">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleResync()}
          disabled={isSyncing}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Syncing...
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Resync
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => void handleDisconnect()}
          disabled={isDisconnecting || isSyncing}
          className="inline-flex h-8 items-center rounded-lg border border-pnl-negative/20 bg-pnl-negative/5 px-3 text-xs font-semibold text-pnl-negative transition hover:bg-pnl-negative/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    </div>
  );
}
