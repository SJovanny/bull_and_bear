"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useTranslation } from "@/lib/i18n/context";

type UserNote = {
  id: string;
  type: "NOTE" | "STRATEGY";
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function NotesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"NOTE" | "STRATEGY">("NOTE");
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editing, setEditing] = useState<UserNote | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes?type=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchNotes();
  }, [fetchNotes]);

  function startNew() {
    setIsNew(true);
    setEditing(null);
    setTitle("");
    setContent("");
  }

  function startEdit(note: UserNote) {
    setIsNew(false);
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
    setTitle("");
    setContent("");
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (isNew) {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: tab, title: title.trim(), content }),
        });
      } else if (editing) {
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, title: title.trim(), content }),
        });
      }
      cancelEdit();
      await fetchNotes();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("notes.deleteConfirm"))) return;
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (editing?.id === id) cancelEdit();
    await fetchNotes();
  }

  async function handleTogglePin(note: UserNote) {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
    });
    await fetchNotes();
  }

  const isEditing = isNew || editing !== null;
  const titlePlaceholder = tab === "NOTE" ? t("notes.titlePlaceholder") : t("notes.strategyTitlePlaceholder");
  const contentPlaceholder = tab === "NOTE" ? t("notes.contentPlaceholder") : t("notes.strategyContentPlaceholder");
  const emptyMessage = tab === "NOTE" ? t("notes.empty") : t("notes.emptyStrategies");

  return (
    <DashboardShell title={t("notes.title")}>
      <div className="mx-auto flex max-w-[960px] flex-col gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface-1 p-1">
            <button
              type="button"
              onClick={() => { setTab("NOTE"); cancelEdit(); }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                tab === "NOTE" ? "bg-brand-500 text-white" : "text-secondary hover:text-primary"
              }`}
            >
              {t("notes.tabNotes")}
            </button>
            <button
              type="button"
              onClick={() => { setTab("STRATEGY"); cancelEdit(); }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                tab === "STRATEGY" ? "bg-brand-500 text-white" : "text-secondary hover:text-primary"
              }`}
            >
              {t("notes.tabStrategies")}
            </button>
          </div>

          <div className="flex-1" />

          {!isEditing && (
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {tab === "NOTE" ? t("notes.newNote") : t("notes.newStrategy")}
            </button>
          )}
        </div>

        {/* Editor */}
        {isEditing && (
          <div className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium text-primary outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-secondary/50"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={contentPlaceholder}
              className="h-48 w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-primary outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-secondary/50"
              maxLength={10000}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary transition hover:bg-surface-2 hover:text-primary"
              >
                {t("notes.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? t("notes.saving") : t("notes.save")}
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
          </div>
        ) : notes.length === 0 && !isEditing ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-16 text-center">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-secondary/40">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <p className="text-sm text-secondary">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group rounded-xl border bg-surface-1 p-4 shadow-sm transition hover:shadow-md ${
                  note.isPinned ? "border-brand-500/30 bg-brand-500/[0.02]" : "border-border"
                } ${editing?.id === note.id ? "ring-2 ring-brand-500/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {note.isPinned && (
                        <svg fill="currentColor" viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-brand-500">
                          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                        </svg>
                      )}
                      <h3 className="text-sm font-semibold text-primary truncate">{note.title}</h3>
                    </div>
                    {note.content && (
                      <p className="mt-1.5 text-sm text-secondary line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                    )}
                    <p className="mt-2 text-[11px] text-secondary/60">
                      {t("notes.updated")} {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(note)}
                      title={note.isPinned ? t("notes.unpin") : t("notes.pin")}
                      className="rounded-md p-1.5 text-secondary transition hover:bg-surface-2 hover:text-primary"
                    >
                      <svg fill={note.isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(note)}
                      className="rounded-md p-1.5 text-secondary transition hover:bg-surface-2 hover:text-primary"
                    >
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="rounded-md p-1.5 text-secondary transition hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
