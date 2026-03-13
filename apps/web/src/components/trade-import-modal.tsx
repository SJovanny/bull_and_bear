"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type TradeImportSource = "CTRADER" | "METATRADER";

type PreviewRow = {
  rowNumber: number;
  importSource: TradeImportSource;
  importSourceTradeId: string | null;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  openedAt: string;
  closedAt: string;
  netPnl: number;
  duplicateReason: "source_trade_id" | "fingerprint" | "same_file" | null;
};

type PreviewResponse = {
  detectedSource: TradeImportSource | null;
  rows: PreviewRow[];
  errors: Array<{ rowNumber: number; message: string }>;
  summary: {
    totalRows: number;
    readyToImport: number;
    duplicates: number;
    errors: number;
  };
};

type TradeImportModalProps = {
  isOpen: boolean;
  accountId: string | null;
  onClose: () => void;
  onImported?: () => void | Promise<void>;
};

const sourceConfig: Record<TradeImportSource, { label: string; helper: string; accept: string }> = {
  CTRADER: {
    label: "cTrader",
    helper: "Importe un statement CSV exporte depuis l'historique cTrader.",
    accept: ".csv,text/csv",
  },
  METATRADER: {
    label: "MetaTrader",
    helper: "Importe un rapport XLSX d'historique de compte MT4 ou MT5.",
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
};

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function duplicateLabel(reason: PreviewRow["duplicateReason"]) {
  if (reason === "source_trade_id") return "Deja importe (id source)";
  if (reason === "fingerprint") return "Deja importe (empreinte)";
  if (reason === "same_file") return "Doublon dans le fichier";
  return "Pret";
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }

  return btoa(binary);
}

export function TradeImportModal({ isOpen, accountId, onClose, onImported }: TradeImportModalProps) {
  const [source, setSource] = useState<TradeImportSource>("CTRADER");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSource("CTRADER");
      setFileName("");
      setFileContent("");
      setPreview(null);
      setError(null);
      setIsReading(false);
      setIsPreviewing(false);
      setIsImporting(false);
    }
  }, [isOpen]);

  const mismatchMessage = useMemo(() => {
    if (!preview?.detectedSource || preview.detectedSource === source) {
      return null;
    }

    return `Le fichier ressemble a un export ${sourceConfig[preview.detectedSource].label}, pas ${sourceConfig[source].label}.`;
  }, [preview?.detectedSource, source]);

  if (!isOpen) {
    return null;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(null);
    setError(null);

    if (!file) {
      setFileName("");
      setFileContent("");
      return;
    }

    setFileName(file.name);
    setIsReading(true);

    try {
      const nextContent =
        source === "METATRADER"
          ? arrayBufferToBase64(await file.arrayBuffer())
          : await file.text();
      setFileContent(nextContent);
    } catch {
      setError("Impossible de lire le fichier.");
      setFileContent("");
    } finally {
      setIsReading(false);
    }
  }

  async function previewImport() {
    if (!accountId) {
      setError("Selectionne un compte avant d'importer.");
      return;
    }

    if (!fileContent.trim()) {
      setError("Ajoute un fichier avant de lancer la previsualisation.");
      return;
    }

    setIsPreviewing(true);
    setError(null);

    try {
      const response = await fetch("/api/trades/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, source, fileName, fileContent }),
      });
      const payload = (await response.json()) as PreviewResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not preview import");
      }

      setPreview(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function confirmImport() {
    if (!accountId || !preview) {
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch("/api/trades/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, source, fileName, fileContent }),
      });
      const payload = (await response.json()) as { imported?: number; skipped?: number; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not import trades");
      }

      await onImported?.();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6" onClick={onClose}>
      <div
        className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-secondary font-sans">Import trades</h2>
            <p className="mt-1 text-sm text-secondary font-sans">Choisis la source, charge un fichier, verifie les doublons puis confirme.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-secondary transition hover:bg-surface-2 hover:text-primary font-sans"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={!preview || preview.summary.readyToImport === 0 || isImporting || Boolean(mismatchMessage)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-border disabled:text-secondary disabled:shadow-none font-sans"
            >
              {isImporting ? "Import..." : `Importer ${preview?.summary.readyToImport ?? 0} trade${(preview?.summary.readyToImport ?? 0) > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-border bg-surface-2/40 p-4 lg:border-b-0 lg:border-r lg:p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary font-sans">Source</p>
                <div className="mt-3 space-y-3">
                  {(Object.keys(sourceConfig) as TradeImportSource[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSource(item);
                        setPreview(null);
                        setError(null);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        source === item
                          ? "border-brand-500 bg-brand-500/5 shadow-sm"
                          : "border-border bg-surface-1 hover:border-brand-500/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-primary font-sans">{sourceConfig[item].label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-secondary font-sans">{sourceConfig[item].helper}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary font-sans">Fichier</p>
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-1 px-4 py-8 text-center transition hover:border-brand-500/50 hover:bg-brand-500/5">
                  <span className="text-sm font-semibold text-primary font-sans">{fileName || "Choisir un fichier"}</span>
                  <span className="mt-2 text-xs text-secondary font-sans">
                    {source === "CTRADER" ? "CSV exporte depuis Statement" : "Rapport XLSX exporte depuis Account History"}
                  </span>
                  <input type="file" accept={sourceConfig[source].accept} onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={previewImport}
                disabled={isReading || isPreviewing || !fileContent}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 font-sans"
              >
                {isReading ? "Lecture..." : isPreviewing ? "Analyse..." : "Previsualiser l'import"}
              </button>

              {preview ? (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm font-sans">
                  <p className="font-semibold text-primary">Resume</p>
                  <div className="mt-3 space-y-2 text-secondary">
                    <p>{preview.summary.totalRows} ligne(s) detectee(s)</p>
                    <p>{preview.summary.readyToImport} pret(es) a importer</p>
                    <p>{preview.summary.duplicates} doublon(s)</p>
                    <p>{preview.summary.errors} erreur(s)</p>
                  </div>
                </div>
              ) : null}

              {mismatchMessage ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 font-sans">{mismatchMessage}</p> : null}
              {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 font-sans">{error}</p> : null}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-primary font-sans">Previsualisation</p>
              <p className="mt-1 text-xs text-secondary font-sans">Seuls les trades fermes sans doublon seront importes.</p>
            </div>

            {!preview ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-secondary font-sans">
                Charge un export puis lance la previsualisation pour verifier les trades detectes.
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1fr_280px]">
                <div className="overflow-auto px-4 py-4 sm:px-6">
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <table className="min-w-full divide-y divide-border text-left text-sm font-sans">
                      <thead className="bg-surface-2/70 text-secondary">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Ligne</th>
                          <th className="px-3 py-2 font-semibold">Trade</th>
                          <th className="px-3 py-2 font-semibold">Prix</th>
                          <th className="px-3 py-2 font-semibold">Horaires</th>
                          <th className="px-3 py-2 font-semibold">Net</th>
                          <th className="px-3 py-2 font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-surface-1">
                        {preview.rows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.importSourceTradeId ?? row.symbol}`}>
                            <td className="px-3 py-3 align-top text-secondary">{row.rowNumber}</td>
                            <td className="px-3 py-3 align-top">
                              <p className="font-semibold text-primary">{row.symbol} · {row.side}</p>
                              <p className="mt-1 text-xs text-secondary">Qty {formatNumber(row.quantity)} · Fees {formatNumber(row.fees)}</p>
                            </td>
                            <td className="px-3 py-3 align-top text-secondary">
                              <p>In {formatNumber(row.entryPrice)}</p>
                              <p className="mt-1">Out {formatNumber(row.exitPrice)}</p>
                            </td>
                            <td className="px-3 py-3 align-top text-secondary">
                              <p>{new Date(row.openedAt).toLocaleString()}</p>
                              <p className="mt-1">{new Date(row.closedAt).toLocaleString()}</p>
                            </td>
                            <td className={`px-3 py-3 align-top font-medium ${row.netPnl >= 0 ? "text-pnl-positive" : "text-pnl-negative"}`}>
                              {row.netPnl > 0 ? "+" : ""}{formatNumber(row.netPnl)}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  row.duplicateReason
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-pnl-positive/10 text-pnl-positive"
                                }`}
                              >
                                {duplicateLabel(row.duplicateReason)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside className="border-t border-border bg-surface-2/30 p-4 lg:border-l lg:border-t-0">
                  <p className="text-sm font-semibold text-primary font-sans">Erreurs</p>
                  {preview.errors.length === 0 ? (
                    <p className="mt-3 text-sm text-secondary font-sans">Aucune erreur de parsing.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {preview.errors.map((item) => (
                        <div key={`${item.rowNumber}-${item.message}`} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 font-sans">
                          Ligne {item.rowNumber}: {item.message}
                        </div>
                      ))}
                    </div>
                  )}
                </aside>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
