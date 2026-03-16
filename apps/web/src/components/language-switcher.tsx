"use client";

import { useEffect, useState } from "react";

import { useTranslation } from "@/lib/i18n/context";

function FlagIcon({ locale }: { locale: "fr" | "en" }) {
  if (locale === "fr") {
    return (
      <span className="inline-flex h-5 w-7 overflow-hidden rounded-[4px] border border-white/12 shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
        <span className="h-full w-1/3 bg-[#1f3fb3]" />
        <span className="h-full w-1/3 bg-[#f7f7f5]" />
        <span className="h-full w-1/3 bg-[#d33a32]" />
      </span>
    );
  }

  return (
    <span className="relative inline-flex h-5 w-7 overflow-hidden rounded-[4px] border border-white/12 bg-[#b22234] shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
      <span className="absolute inset-x-0 top-[15%] h-[10%] bg-white" />
      <span className="absolute inset-x-0 top-[35%] h-[10%] bg-white" />
      <span className="absolute inset-x-0 top-[55%] h-[10%] bg-white" />
      <span className="absolute inset-x-0 top-[75%] h-[10%] bg-white" />
      <span className="absolute left-0 top-0 h-[58%] w-[45%] bg-[#3c3b6e]" />
    </span>
  );
}

export function LanguageSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    setLocale(locale === "fr" ? "en" : "fr");
  }

  // Prevent hydration mismatch by not rendering until mounted.
  if (!mounted) {
    return <div className="h-[40px] w-[100px] opacity-0" aria-hidden="true" />;
  }

  const nextLocale = locale === "fr" ? "en" : "fr";
  const label = locale === "fr" ? "Francais" : "English";

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
      aria-label="Switch language"
    >
      <span className={`shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`}>
        <FlagIcon locale={locale} />
      </span>

      {!isCollapsed && <span>{label}</span>}

      {isCollapsed && (
        <div className="absolute left-full z-50 ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
          {label}
        </div>
      )}

      {!isCollapsed && (
        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {nextLocale}
        </span>
      )}
    </button>
  );
}
