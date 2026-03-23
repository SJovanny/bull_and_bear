"use client";

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

  function toggle() {
    setLocale(locale === "fr" ? "en" : "fr");
  }

  const nextLocale = locale === "fr" ? "en" : "fr";
  const label = locale === "fr" ? "Français" : "English";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 ${isCollapsed ? "w-full justify-center" : "w-auto justify-center"}`}
      aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
      title={label}
    >
      <span className="shrink-0">
        <FlagIcon locale={locale} />
      </span>

      <span className="sr-only">{label}</span>
    </button>
  );
}
