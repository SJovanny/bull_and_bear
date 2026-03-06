"use client";

import { useState, useEffect } from "react";
import { IconThemeDark, IconThemeLight } from "./icons";

export function ThemeToggle({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("bb_theme") as "light" | "dark" | null;
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("bb_theme", nextTheme);
  }

  const label = theme === "light" ? "Mode sombre" : "Mode clair";
  const Icon = theme === "light" ? IconThemeDark : IconThemeLight;

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