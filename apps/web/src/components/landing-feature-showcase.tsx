"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { IconDashboard, IconJournal, IconStats } from "@/components/icons";
import { useTranslation } from "@/lib/i18n/context";

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
// The features array now requires translations, so we'll build it dynamically inside the component or pass t downwards.
// It's cleaner to build it inside the component to access `t`.
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
  const isReversed = index % 2 === 1;

  return (
    <div className={`grid items-center gap-16 lg:grid-cols-12 lg:gap-20 xl:gap-24 transition-all duration-700`}>
      {/* Text block */}
      <div className={`lg:col-span-4 ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/62">
          0{index + 1} {feature.eyebrow}
        </p>

        <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem] sm:leading-[1.15] lg:text-[3rem] lg:leading-[1.1]">
          {feature.title}
        </h3>

        <p className="mt-8 max-w-[560px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
          {feature.description}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
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
      <div className={`lg:col-span-8 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
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
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      id: "dashboard",
      eyebrow: t("landing.showcase.feat1.eyebrow"),
      title: t("landing.showcase.feat1.title"),
      description: t("landing.showcase.feat1.desc"),
      bullets: [
        t("landing.showcase.feat1.bullet1"),
        t("landing.showcase.feat1.bullet2"),
        t("landing.showcase.feat1.bullet3"),
      ],
      imageSrc: "/dashboard_example.png",
      fallbackSrc: "/dashboard_example.png",
      accent: "from-cyan-300/20 via-sky-300/10 to-transparent",
      Icon: IconDashboard,
    },
    {
      id: "journal",
      eyebrow: t("landing.showcase.feat2.eyebrow"),
      title: t("landing.showcase.feat2.title"),
      description: t("landing.showcase.feat2.desc"),
      bullets: [
        t("landing.showcase.feat2.bullet1"),
        t("landing.showcase.feat2.bullet2"),
        t("landing.showcase.feat2.bullet3"),
      ],
      imageSrc: "/journal_example.png",
      fallbackSrc: "/journal_example.png",
      accent: "from-teal-300/20 via-emerald-300/10 to-transparent",
      Icon: IconJournal,
    },
    {
      id: "stats",
      eyebrow: t("landing.showcase.feat3.eyebrow"),
      title: t("landing.showcase.feat3.title"),
      description: t("landing.showcase.feat3.desc"),
      bullets: [
        t("landing.showcase.feat3.bullet1"),
        t("landing.showcase.feat3.bullet2"),
        t("landing.showcase.feat3.bullet3"),
      ],
      imageSrc: "/calendar%20example.png",
      fallbackSrc: "/calendar%20example.png",
      accent: "from-amber-300/20 via-orange-300/10 to-transparent",
      Icon: IconStats,
    },
  ];

  return (
    <section id="fonctionnalites" className="relative border-t border-white/10 px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
      <div className="mx-auto max-w-[1380px]">
        {/* Section heading */}
        <div className="mx-auto max-w-[760px] text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
            {t("landing.showcase.eyebrow")}
          </span>
          <h2 className="mt-10 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
            {t("landing.showcase.title")}
          </h2>
          <p className="mt-8 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
            {t("landing.showcase.description")}
          </p>
        </div>

        {/* Feature rows */}
        <div className="mt-28 flex flex-col gap-32 lg:mt-40 lg:gap-40">
          {features.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
