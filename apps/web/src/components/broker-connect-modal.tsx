"use client";

import { useEffect, useState } from "react";

type CTraderAccount = {
  ctidTraderAccountId: string;
  isLive: boolean;
  brokerTitle?: string;
  traderLogin?: string;
};

type BrokerConnectModalProps = {
  isOpen: boolean;
  accountId: string;
  accountName: string;
  /** Pre-parsed cTrader account selection payload from URL (base64url) */
  selectPayload?: string | null;
  onClose: () => void;
  onConnected: () => void;
};

type Step = "intro" | "selecting" | "linking" | "done" | "error";

export default function BrokerConnectModal({
  isOpen,
  accountId,
  accountName,
  selectPayload,
  onClose,
  onConnected,
}: BrokerConnectModalProps) {
  const [step, setStep] = useState<Step>("intro");
  const [ctraderAccounts, setCtraderAccounts] = useState<CTraderAccount[]>([]);
  const [selectedCtid, setSelectedCtid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When the modal opens with a selectPayload, the user already completed OAuth
  // and needs to pick from multiple cTrader accounts
  useEffect(() => {
    if (!isOpen) return;

    if (selectPayload) {
      try {
        const decoded = JSON.parse(atob(selectPayload.replace(/-/g, "+").replace(/_/g, "/"))) as {
          accounts?: CTraderAccount[];
        };
        if (decoded.accounts && decoded.accounts.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCtraderAccounts(decoded.accounts);
          setStep("selecting");
          return;
        }
      } catch {
        setStep("error");
        setErrorMsg("Failed to decode account selection data.");
        return;
      }
    }

    setStep("intro");
    setErrorMsg(null);
    setSelectedCtid(null);
    setCtraderAccounts([]);
  }, [isOpen, selectPayload]);

  async function handleConnectClick() {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/connections/ctrader/authorize?accountId=${encodeURIComponent(accountId)}`,
      );
      const data = (await res.json()) as { authUrl?: string; error?: string };

      if (!res.ok || !data.authUrl) {
        throw new Error(data.error ?? "Could not generate authorization URL");
      }

      // Redirect to cTrader OAuth page
      window.location.href = data.authUrl;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error");
      setIsLoading(false);
    }
  }

  async function handleSelectAccount() {
    if (!selectedCtid || !selectPayload) return;

    setStep("linking");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/connections/ctrader/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, payload: selectPayload, ctidTraderAccountId: selectedCtid }),
      });

      const data = (await res.json()) as { connection?: unknown; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Could not link account");
      }

      setStep("done");
      onConnected();
    } catch (err) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect cTrader account"
        className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {/* cTrader logo placeholder */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 overflow-hidden">
              <img
                src="https://res.cloudinary.com/ddvabefhf/image/upload/v1773440476/ctrader_logo_full_pwcbdz.png"
                alt="cTrader"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary font-sans">Connect cTrader</p>
              <p className="text-xs text-secondary font-sans truncate max-w-[200px]">{accountName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:text-primary transition"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Intro step ─────────────────────────────────────────────── */}
        {step === "intro" && (
          <>
            <div className="rounded-xl border border-border bg-surface-2 p-4 mb-5 space-y-2 text-sm text-secondary font-sans">
              <p className="font-semibold text-primary">How it works</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click <strong className="text-primary">Connect with cTrader</strong> below</li>
                <li>Log in to your cTrader ID and grant access</li>
                <li>You&apos;re redirected back here automatically</li>
                <li>Click <strong className="text-primary">Resync</strong> on your account anytime to pull new trades</li>
              </ol>
              <p className="text-xs text-secondary pt-1">
                Read-only access only. We never place orders or modify your account.
              </p>
            </div>

            {errorMsg && (
              <p className="mb-4 rounded-lg bg-pnl-negative/10 border border-pnl-negative/20 px-3 py-2 text-sm text-pnl-negative font-sans">
                {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleConnectClick()}
                disabled={isLoading}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Redirecting..." : "Connect with cTrader"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface-1 px-4 text-sm font-semibold text-primary transition hover:bg-surface-2"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── Account selection step ──────────────────────────────────── */}
        {step === "selecting" && (
          <>
            <p className="text-sm text-secondary font-sans mb-4">
              Multiple cTrader accounts found. Select the one to link to <strong className="text-primary">{accountName}</strong>:
            </p>

            <div className="space-y-2 mb-5">
              {ctraderAccounts.map((a) => (
                <label
                  key={a.ctidTraderAccountId}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedCtid === a.ctidTraderAccountId
                      ? "border-brand-500 bg-brand-500/5"
                      : "border-border bg-surface-2 hover:border-brand-500/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="ctid"
                    value={a.ctidTraderAccountId}
                    checked={selectedCtid === a.ctidTraderAccountId}
                    onChange={() => setSelectedCtid(a.ctidTraderAccountId)}
                    className="accent-brand-500"
                  />
                  <div className="text-sm font-sans">
                    <p className="font-semibold text-primary">
                      {a.brokerTitle ?? "cTrader Account"}{" "}
                      <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${a.isLive ? "bg-pnl-positive/10 text-pnl-positive" : "bg-amber-500/10 text-amber-600"}`}>
                        {a.isLive ? "Live" : "Demo"}
                      </span>
                    </p>
                    {a.traderLogin && (
                      <p className="text-xs text-secondary">Login: {a.traderLogin}</p>
                    )}
                    <p className="text-xs text-secondary">ID: {a.ctidTraderAccountId}</p>
                  </div>
                </label>
              ))}
            </div>

            {errorMsg && (
              <p className="mb-4 rounded-lg bg-pnl-negative/10 border border-pnl-negative/20 px-3 py-2 text-sm text-pnl-negative font-sans">
                {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleSelectAccount()}
                disabled={!selectedCtid || isLoading}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Linking..." : "Link Selected Account"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface-1 px-4 text-sm font-semibold text-primary transition hover:bg-surface-2"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── Linking step ───────────────────────────────────────────── */}
        {step === "linking" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm text-secondary font-sans">Linking your cTrader account...</p>
          </div>
        )}

        {/* ── Done step ──────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pnl-positive/10">
              <svg className="h-6 w-6 text-pnl-positive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-primary font-sans">cTrader connected!</p>
              <p className="mt-1 text-sm text-secondary font-sans">
                Use the <strong>Resync</strong> button on your account to pull the latest trades anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Error step ─────────────────────────────────────────────── */}
        {step === "error" && (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pnl-negative/10">
              <svg className="h-6 w-6 text-pnl-negative" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-primary font-sans">Connection failed</p>
              {errorMsg && (
                <p className="mt-1 text-sm text-secondary font-sans">{errorMsg}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep("intro"); setErrorMsg(null); }}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold text-primary transition hover:bg-surface-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
