"use client";

import { useState, useEffect } from "react";
import { IconThemeDark, IconThemeLight } from "./icons";
import { useTranslation } from "@/lib/i18n/context";

export function ThemeToggle({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("bb_theme") as "light" | "dark" | null;
    const initial = savedTheme === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("bb_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  const { t } = useTranslation();
  const label = theme === "light" ? t("theme.dark") : t("theme.light");
  const Icon = theme === "light" ? IconThemeDark : IconThemeLight;

  if (!mounted) {
    return (
      <button
        type="button"
        className="group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
        aria-label="Toggle theme"
      >
        <IconThemeLight className="h-5 w-5 shrink-0 mr-3" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200`}
      aria-label="Toggle theme"
    >
      <Icon className={`h-5 w-5 shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
      
      {!isCollapsed && <span>{label}</span>}
      
      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50">
          {label}
        </div>
      )}
    </button>
  );
}