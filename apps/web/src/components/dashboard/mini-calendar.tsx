"use client";

import Link from "next/link";
import { formatNumber, compactPnl, pnlColorClass, pnlBgClass, toDateKey } from "@/lib/format";

type MiniCalendarProps = {
  miniCalendarDays: Date[];
  monthPnlByDay: Map<string, number>;
  firstDay: Date;
};

export function MiniCalendar({ miniCalendarDays, monthPnlByDay, firstDay }: MiniCalendarProps) {
  return (
    <article className="rounded-xl border border-border bg-surface-1 p-6 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Calendar Preview</h2>
        <Link href="/journal" className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors font-sans">
          Full Journal
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.06em] text-secondary font-sans shrink-0">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={i} className="py-2">{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2 sm:gap-3 flex-1 auto-rows-fr">
        {miniCalendarDays.map((day) => {
          const key = toDateKey(day);
          const isCurrentMonth = day.getMonth() === firstDay.getMonth();
          const pnl = monthPnlByDay.get(key) ?? 0;
          const hasData = monthPnlByDay.has(key);

          // Build dynamic classes
          let containerClasses = "rounded-lg border p-2 sm:p-3 text-center transition-all flex flex-col items-center justify-center ";
          
          if (isCurrentMonth) {
            if (hasData) {
               containerClasses += `${pnlBgClass(pnl)} border-transparent ${pnlColorClass(pnl)} bg-opacity-15`;
            } else {
               containerClasses += "border-border bg-surface-1 text-secondary hover:bg-surface-2";
            }
          } else {
             containerClasses += "border-transparent bg-surface-2 text-secondary opacity-50";
          }

          return (
            <div
              key={key}
              className={containerClasses}
              title={`${key} · ${formatNumber(pnl)}`}
            >
              <p className="font-semibold leading-none font-sans text-xs sm:text-sm">{day.getDate()}</p>
              {isCurrentMonth && hasData ? (
                <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] leading-none opacity-90 font-mono tracking-tight">{compactPnl(pnl)}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}