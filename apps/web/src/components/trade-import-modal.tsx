"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "@/lib/i18n/context";
import { TranslationKeys } from "@/lib/i18n/types";

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

const sourceConfig = (t: (key: keyof TranslationKeys) => string): Record<TradeImportSource, { label: string; helper: string; accept: string; image: string; alt: string }> => ({
  CTRADER: {
    label: "cTrader",
    helper: t("importModal.cTraderHelper"),
    accept: ".csv,text/csv",
    image: "https://res.cloudinary.com/ddvabefhf/image/upload/v1773440476/ctrader_logo_full_pwcbdz.png",
    alt: "cTrader logo",
  },
  METATRADER: {
    label: "MetaTrader",
    helper: t("importModal.mtHelper"),
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    image: "https://res.cloudinary.com/ddvabefhf/image/upload/v1773439524/mt5_i8o5cc.jpg",
    alt: "MetaTrader logo",
  },
});

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function duplicateLabel(reason: PreviewRow["duplicateReason"], t: (key: keyof TranslationKeys) => string) {
  if (reason === "source_trade_id") return t("importModal.dupSourceId");
  if (reason === "fingerprint") return t("importModal.dupFingerprint");
  if (reason === "same_file") return t("importModal.dupSameFile");
  return t("importModal.dupReady");
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
  const { t } = useTranslation();

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

    const config = sourceConfig(t);
    return t("importModal.mismatchFile")
      .replace("{detected}", config[preview.detectedSource].label)
      .replace("{selected}", config[source].label);
  }, [preview?.detectedSource, source, t]);

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
      setError(t("importModal.readError"));
      setFileContent("");
    } finally {
      setIsReading(false);
    }
  }

  async function previewImport() {
    if (!accountId) {
      setError(t("importModal.selectAccount"));
      return;
    }

    if (!fileContent.trim()) {
      setError(t("importModal.addFileFirst"));
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
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-secondary font-sans">{t("importModal.title")}</h2>
            <p className="mt-1 text-sm text-secondary font-sans">{t("importModal.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-secondary transition hover:bg-surface-2 hover:text-primary font-sans"
            >
              {t("importModal.close")}
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={!preview || preview.summary.readyToImport === 0 || isImporting || Boolean(mismatchMessage)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-border disabled:text-secondary disabled:shadow-none font-sans"
            >
              {isImporting ? t("importModal.importing") : `${t("importModal.importBtn")} ${preview?.summary.readyToImport ?? 0} trade${(preview?.summary.readyToImport ?? 0) > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-border bg-surface-2/40 p-4 lg:border-b-0 lg:border-r lg:p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary font-sans">{t("importModal.source")}</p>
                <div className="mt-3 space-y-3">
                  {(Object.keys(sourceConfig(t)) as TradeImportSource[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSource(item);
                        setPreview(null);
                        setError(null);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition flex items-start gap-4 ${
                        source === item
                          ? "border-brand-500 bg-brand-500/5 shadow-sm"
                          : "border-border bg-surface-1 hover:border-brand-500/40"
                      }`}
                    >
                      <div className={`shrink-0 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border ${source === item ? 'border-brand-500/30' : 'border-border/50'} bg-white`}>
                        <Image
                          src={sourceConfig(t)[item].image}
                          alt={sourceConfig(t)[item].alt}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary font-sans">{sourceConfig(t)[item].label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-secondary font-sans">{sourceConfig(t)[item].helper}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary font-sans">{t("importModal.file")}</p>
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-1 px-4 py-8 text-center transition hover:border-brand-500/50 hover:bg-brand-500/5">
                  <span className="text-sm font-semibold text-primary font-sans">{fileName || t("importModal.chooseFile")}</span>
                  <span className="mt-2 text-xs text-secondary font-sans">
                    {source === "CTRADER" ? t("importModal.cTraderHelper") : t("importModal.mtHelper")}
                  </span>
                  <input type="file" accept={sourceConfig(t)[source].accept} onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={previewImport}
                disabled={isReading || isPreviewing || !fileContent}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 font-sans"
              >
                {isReading ? t("importModal.reading") : isPreviewing ? t("importModal.analyzing") : t("importModal.preview")}
              </button>

              {preview ? (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm font-sans">
                  <p className="font-semibold text-primary">{t("importModal.summary")}</p>
                  <div className="mt-3 space-y-2 text-secondary">
                    <p>{preview.summary.totalRows} {t("importModal.linesDetected")}</p>
                    <p>{preview.summary.readyToImport} {t("importModal.readyToImport")}</p>
                    <p>{preview.summary.duplicates} {t("importModal.duplicates")}</p>
                    <p>{preview.summary.errors} {t("importModal.errors")}</p>
                  </div>
                </div>
              ) : null}

              {mismatchMessage ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 font-sans">{mismatchMessage}</p> : null}
              {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 font-sans">{error}</p> : null}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-primary font-sans">{t("importModal.previewTitle")}</p>
              <p className="mt-1 text-xs text-secondary font-sans">{t("importModal.previewDesc")}</p>
            </div>

            {!preview ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-secondary font-sans">
                {t("importModal.previewEmpty")}
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1fr_280px]">
                <div className="overflow-auto px-4 py-4 sm:px-6">
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <table className="min-w-full divide-y divide-border text-left text-sm font-sans">
                      <thead className="bg-surface-2/70 text-secondary">
                        <tr>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tableRow")}</th>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tableTrade")}</th>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tablePrice")}</th>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tableDates")}</th>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tableNet")}</th>
                          <th className="px-3 py-2 font-semibold">{t("importModal.tableStatus")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-surface-1">
                        {preview.rows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.importSourceTradeId ?? row.symbol}`}>
                            <td className="px-3 py-3 align-top text-secondary">{row.rowNumber}</td>
                            <td className="px-3 py-3 align-top">
                              <p className="font-semibold text-primary">{row.symbol} · {row.side}</p>
                              <p className="mt-1 text-xs text-secondary">{t("importModal.qty")} {formatNumber(row.quantity)} · {t("importModal.fees")} {formatNumber(row.fees)}</p>
                            </td>
                            <td className="px-3 py-3 align-top text-secondary">
                              <p>{t("importModal.in")} {formatNumber(row.entryPrice)}</p>
                              <p className="mt-1">{t("importModal.out")} {formatNumber(row.exitPrice)}</p>
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
                                {duplicateLabel(row.duplicateReason, t)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside className="border-t border-border bg-surface-2/30 p-4 lg:border-l lg:border-t-0">
                  <p className="text-sm font-semibold text-primary font-sans">{t("importModal.errorTitle")}</p>
                  {preview.errors.length === 0 ? (
                    <p className="mt-3 text-sm text-secondary font-sans">{t("importModal.noErrors")}</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {preview.errors.map((item) => (
                        <div key={`${item.rowNumber}-${item.message}`} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 font-sans">
                          {t("importModal.tableRow")} {item.rowNumber}: {item.message}
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
