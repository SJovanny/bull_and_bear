"use client";

import Link from "next/link";

import { compactPnl, formatNumber, pnlBgClass, pnlColorClass } from "@/lib/format";
import type { CalendarDay } from "@/types";

type MiniCalendarProps = {
  days: CalendarDay[];
};

export function MiniCalendar({ days }: MiniCalendarProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[#2e2e2e] bg-surface-1 p-6 shadow-none border border-[#2e2e2e] transition-all hover:shadow-none border border-[#2e2e2e]">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-secondary">Calendar Preview</h2>
        <Link href="/journal" className="font-sans text-xs font-medium text-brand-500 transition-colors hover:text-brand-600">
          Full Journal
        </Link>
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-2 text-center font-sans text-xs font-semibold uppercase tracking-[0.06em] text-secondary sm:gap-3 sm:text-sm">
        {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
          <div key={index} className="py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid flex-1 auto-rows-fr grid-cols-7 gap-2 sm:gap-3">
        {days.map((day) => {
          let containerClasses = "flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all sm:p-3";
          let dayNumberClasses = "font-sans text-xs font-semibold leading-none sm:text-sm";
          let pnlTextClasses = "mt-1.5 font-mono text-[9px] leading-none tracking-tight opacity-90 sm:mt-2 sm:text-[10px]";

          if (day.inMonth) {
            if (day.tradeCount > 0) {
              containerClasses += ` ${pnlBgClass(day.pnl)} border-transparent bg-opacity-15`;
              dayNumberClasses += " text-primary";
              pnlTextClasses += ` ${pnlColorClass(day.pnl)}`;
            } else {
              containerClasses += " border-[#2e2e2e] bg-surface-1 text-secondary hover:bg-surface-2";
            }
          } else {
            containerClasses += " border-transparent bg-surface-2 text-secondary opacity-50";
          }

          return (
            <div
              key={day.date}
              className={containerClasses}
              title={`${day.date} · ${formatNumber(day.pnl)} · ${day.tradeCount} trades${day.hasJournal ? " · journal" : ""}`}
            >
              <p className={dayNumberClasses}>{Number(day.date.slice(-2))}</p>
              {day.inMonth && day.tradeCount > 0 ? <p className={pnlTextClasses}>{compactPnl(day.pnl)}</p> : null}
              {day.inMonth && day.hasJournal ? <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-brand-500" /> : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
