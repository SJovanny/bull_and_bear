"use client";

import { useTranslation } from "@/lib/i18n/context";

export function LanguageSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { locale, setLocale } = useTranslation();

  function toggle() {
    setLocale(locale === "fr" ? "en" : "fr");
  }

  const flag = locale === "fr" ? "🇫🇷" : "🇬🇧";
  const label = locale === "fr" ? "Français" : "English";

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
      aria-label="Switch language"
    >
      <span className={`text-lg shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`}>{flag}</span>

      {!isCollapsed && <span>{label}</span>}

      {isCollapsed && (
        <div className="absolute left-full ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50">
          {label}
        </div>
      )}
    </button>
  );
}
