"use client";

import { useEffect, useRef, useState } from "react";

export type TocSection = {
  id: string;
  labelFr: string;
  labelEn: string;
};

type LegalTocProps = {
  sections: TocSection[];
  lang: "fr" | "en";
};

export function LegalToc({ sections, lang }: LegalTocProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  return (
    <nav aria-label="Table of contents">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {lang === "fr" ? "Sommaire" : "Contents"}
      </p>
      <ol className="space-y-1">
        {sections.map(({ id, labelFr, labelEn }) => {
          const label = lang === "fr" ? labelFr : labelEn;
          const isActive = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                )}
                <span className={isActive ? "" : "ml-3.5"}>{label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
