"use client";

import Link from "next/link";
import { formatNumber, pnlColorClass } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/context";
import type { Trade } from "@/types";

type RecentTradesProps = {
  loading: boolean;
  trades: Trade[];
};

export function RecentTrades({ loading, trades }: RecentTradesProps) {
  const { t } = useTranslation();
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
      <div className="border-b border-border px-4 py-3 shrink-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("recentTrades.title")}</h2>
      </div>

      <div className="flex-1 overflow-auto max-h-[800px]">
        <table className="min-w-full divide-y divide-border text-xs relative">
          <thead className="sticky top-0 z-10 bg-surface-2 text-[10px] uppercase tracking-wide text-secondary font-sans shadow-[0_1px_0_var(--color-border)]">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">{t("recentTrades.symbol")}</th>
              <th className="px-3 py-2.5 text-left font-semibold">{t("recentTrades.side")}</th>
              <th className="px-3 py-2.5 text-left font-semibold">{t("recentTrades.qty")}</th>
              <th className="px-3 py-2.5 text-left font-semibold">{t("recentTrades.netPnl")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface-1">
            {!loading && trades.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-secondary font-sans">
                  {t("recentTrades.empty")}
                </td>
              </tr>
            ) : null}

            {trades.slice(0, 30).map((trade) => (
              <tr key={trade.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-3 py-2.5 font-medium text-primary">
                  <Link href={`/trades/${trade.id}`} className="hover:text-brand-500 transition-colors font-sans font-semibold">
                    {trade.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-secondary font-sans">{trade.side}</td>
                <td className="px-3 py-2.5 text-secondary font-mono">
                  {formatNumber(Number(trade.quantity ?? 0), 4)}
                </td>
                <td className={`px-3 py-2.5 font-medium font-mono ${pnlColorClass(Number(trade.netPnl ?? 0))}`}>
                  {Number(trade.netPnl ?? 0) > 0 ? "+" : ""}
                  {formatNumber(Number(trade.netPnl ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}