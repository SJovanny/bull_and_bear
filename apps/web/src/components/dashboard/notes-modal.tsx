"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

type UserNote = {
  id: string;
  type: "NOTE" | "STRATEGY";
  title: string;
  content: string;
  isPinned: boolean;
  updatedAt: string;
};

type DashboardNotesPopoverProps = {
  open: boolean;
};

export function DashboardNotesPopover({ open }: DashboardNotesPopoverProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);

    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        setNotes(data.notes ?? []);
        setFetched(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, fetched]);

  if (!open) return null;

  // Pinned first, then most recent, limit to 5
  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }).slice(0, 5);

  return (
    <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border bg-surface-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
      {/* Header */}
      <div className="border-b border-border px-4 py-2.5">
        <h3 className="text-xs font-semibold text-primary">{t("dashboard.notesModal.title")}</h3>
      </div>

      {/* Content */}
      <div className="max-h-[320px] overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-xs text-secondary">{t("dashboard.notesModal.empty")}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sorted.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg border p-2.5 ${
                  note.isPinned ? "border-brand-500/30 bg-brand-500/[0.02]" : "border-border"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {note.isPinned && (
                    <span className="rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand-500">
                      {t("dashboard.notesModal.pinned")}
                    </span>
                  )}
                  <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-secondary">
                    {note.type === "STRATEGY" ? t("notes.tabStrategies") : t("notes.tabNotes")}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-semibold text-primary">{note.title}</h4>
                {note.content && (
                  <p className="mt-0.5 text-[11px] text-secondary line-clamp-2 whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <Link
          href="/notes"
          className="flex w-full items-center justify-center rounded-lg border border-border py-1.5 text-xs font-medium text-secondary transition hover:bg-surface-2 hover:text-primary"
        >
          {t("dashboard.notesModal.viewAll")}
        </Link>
      </div>
    </div>
  );
}
