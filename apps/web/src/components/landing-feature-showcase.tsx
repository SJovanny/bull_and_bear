"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { IconDashboard, IconJournal, IconStats } from "@/components/icons";

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  imageSrc: string;
  fallbackSrc: string;
  accent: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
};

const features: Feature[] = [
  {
    id: "dashboard",
    eyebrow: "Performance desk",
    title: "See the entire book before emotion rewrites the day.",
    description:
      "Track PnL, streaks, expectancy, and account momentum in one command-center view built for quick review before the next session.",
    bullets: ["Daily edge snapshot", "Account-level trendlines", "Session review at a glance"],
    imageSrc: "/dashboard_example.png",
    fallbackSrc: "/dashboard_example.png",
    accent: "from-cyan-300/20 via-sky-300/10 to-transparent",
    Icon: IconDashboard,
  },
  {
    id: "journal",
    eyebrow: "Execution journal",
    title: "Capture context while the trade is still honest.",
    description:
      "Log screenshots, thesis, mistakes, and discipline notes so every setup turns into a repeatable lesson instead of a vague memory.",
    bullets: ["Screenshot-backed notes", "Trade-by-trade reflection", "Clean review workflow"],
    imageSrc: "/journal_example.png",
    fallbackSrc: "/journal_example.png",
    accent: "from-teal-300/20 via-emerald-300/10 to-transparent",
    Icon: IconJournal,
  },
  {
    id: "stats",
    eyebrow: "Pattern review",
    title: "Find the behaviors that actually move your equity curve.",
    description:
      "Break performance into patterns over time, spot recurring strengths, and turn your review process into a concrete improvement loop.",
    bullets: ["Calendar-driven review", "Pattern and habit analysis", "Faster weekly debriefs"],
    imageSrc: "/calendar%20example.png",
    fallbackSrc: "/calendar%20example.png",
    accent: "from-amber-300/20 via-orange-300/10 to-transparent",
    Icon: IconStats,
  },
];

function FeatureImage({
  src,
  fallbackSrc,
  alt,
  priority = false,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  priority?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 50vw, 92vw"
      className="object-cover object-top"
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isReversed = index % 2 === 1;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
    >
      {/* Text block */}
      <div className={isReversed ? "lg:order-2" : ""}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/62">
          0{index + 1} {feature.eyebrow}
        </p>

        <h3 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem] sm:leading-[1.15] lg:text-[3rem] lg:leading-[1.1]">
          {feature.title}
        </h3>

        <p className="mt-5 max-w-[560px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
          {feature.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {feature.bullets.map((bullet) => (
            <span
              key={bullet}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
            >
              {bullet}
            </span>
          ))}
        </div>
      </div>

      {/* Image block */}
      <div className={isReversed ? "lg:order-1" : ""}>
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%)]" />
          <div className="pointer-events-none absolute -right-12 top-12 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-16 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#091321]">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent}`} />
            <div className="relative aspect-[16/10]">
              <FeatureImage
                src={feature.imageSrc}
                fallbackSrc={feature.fallbackSrc}
                alt={`${feature.eyebrow} preview`}
                priority={index === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatureShowcase() {
  return (
    <section className="relative border-t border-white/10 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1380px]">
        {/* Section heading */}
        <div className="mx-auto max-w-[760px] text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
            Built for the full review loop
          </span>
          <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
            A trading workspace that gets sharper the more honestly you use it.
          </h2>
          <p className="mt-5 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
            Move from recap to insight with a guided flow: review the numbers, inspect the trades, then lock in the
            pattern.
          </p>
        </div>

        {/* Feature rows */}
        <div className="mt-20 flex flex-col gap-20 lg:mt-28 lg:gap-28">
          {features.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
