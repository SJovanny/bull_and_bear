"use client";

import { useTranslation } from "@/lib/i18n/context";

type Stat = {
  value: string;
  label: string;
};

function StatItem({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4">
      <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {stat.value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {stat.label}
      </span>
    </div>
  );
}

export function LandingStatsBar() {
  const { t } = useTranslation();

  const stats: Stat[] = [
    { value: "cTrader", label: t("landing.stats.autoSync") },
    { value: "MetaTrader", label: t("landing.stats.csvImport") },
    { value: "EN & FR", label: t("landing.stats.languages") },
    { value: "€2.99", label: t("landing.stats.startingFrom") },
  ];

  return (
    <section className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-[1380px] grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
