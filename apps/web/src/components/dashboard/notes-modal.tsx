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

type DashboardNotesModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DashboardNotesModal({ open, onClose }: DashboardNotesModalProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data.notes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  // Pinned first, then most recent, limit to 10
  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-surface-1 shadow-2xl animate-in zoom-in-95 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-primary">{t("dashboard.notesModal.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary transition hover:bg-surface-2 hover:text-primary"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary">{t("dashboard.notesModal.empty")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((note) => (
                <div
                  key={note.id}
                  className={`rounded-lg border p-3 ${
                    note.isPinned ? "border-brand-500/30 bg-brand-500/[0.02]" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {note.isPinned && (
                      <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-500">
                        {t("dashboard.notesModal.pinned")}
                      </span>
                    )}
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-secondary">
                      {note.type === "STRATEGY" ? t("notes.tabStrategies") : t("notes.tabNotes")}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-primary">{note.title}</h3>
                  {note.content && (
                    <p className="mt-1 text-xs text-secondary line-clamp-2 whitespace-pre-wrap">{note.content}</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-secondary/50">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3">
          <Link
            href="/notes"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg border border-border py-2 text-sm font-medium text-secondary transition hover:bg-surface-2 hover:text-primary"
          >
            {t("dashboard.notesModal.viewAll")}
          </Link>
        </div>
      </div>
    </div>
  );
}
