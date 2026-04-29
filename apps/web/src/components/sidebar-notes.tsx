"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

type SidebarNotesProps = {
  isCollapsed: boolean;
};

export function SidebarNotes({ isCollapsed }: SidebarNotesProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes from /api/me on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setNotes(data.user?.importantNotes ?? "");
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    }
    void load();
  }, []);

  // Auto-save with debounce
  const save = useCallback((content: string) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } catch {
        // ignore
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  function handleChange(value: string) {
    setNotes(value);
    save(value);
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        aria-label={t("sidebar.notes.title")}
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <div className="absolute left-full ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50">
          {t("sidebar.notes.title")}
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 transition hover:text-slate-300"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <span className="flex-1 text-left">{t("sidebar.notes.title")}</span>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-2">
          <div className="relative rounded-lg border border-slate-800 bg-slate-900/50">
            <textarea
              value={notes}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={loaded ? t("sidebar.notes.placeholder") : "..."}
              className="h-28 w-full resize-none rounded-lg bg-transparent px-3 py-2 text-xs text-slate-300 outline-none placeholder:text-slate-600"
              maxLength={5000}
              disabled={!loaded}
            />
            {saving && (
              <div className="absolute bottom-1.5 right-2 text-[10px] text-slate-600">
                {t("sidebar.notes.saving")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
