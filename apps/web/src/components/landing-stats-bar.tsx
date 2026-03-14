"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

function useCountUp(target: number, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);

  return value;
}

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

function StatItem({ stat, inView }: { stat: Stat; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView);

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4">
      <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {count.toLocaleString()}
        <span className="text-cyan-400">{stat.suffix}</span>
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {stat.label}
      </span>
    </div>
  );
}

export function LandingStatsBar() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats: Stat[] = [
    { value: 10000, suffix: "+", label: t("landing.stats.tradesAnalyzed") },
    { value: 500, suffix: "+", label: t("landing.stats.tradersOnboard") },
    { value: 2, suffix: "", label: t("landing.stats.brokersIntegrated") },
    { value: 50000, suffix: "+", label: t("landing.stats.dataPoints") },
  ];

  return (
    <section
      ref={ref}
      className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-[1380px] grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} inView={inView} />
        ))}
      </div>
    </section>
  );
}
