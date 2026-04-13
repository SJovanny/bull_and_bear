"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNumber, pnlColorClass, compactPnl } from "@/lib/format";
import {
  journalMentalStates,
  journalMistakes,
  journalStrategies,
  mentalStateLabelKeys,
  mistakeLabelKeys,
  strategyLabelKeys,
} from "@/lib/journal-labels";
import { useTranslation } from "@/lib/i18n/context";
import type { Trade } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type EconomicEvent = {
  id: string;
  time: string;
  name: string;
  forecast: string;
  actual: string;
  impact: "low" | "medium" | "high";
};

type JournalEntry = {
  id?: string;
  economicEvents: EconomicEvent[];
  marketConditions: string;
  keyLevels: string;
  strategiesFocus: string[];
  executionRating: number;
  mentalState: string[];
  mistakes: string[];
  lessonsLearned: string;
  notes: string;
};

const defaultJournal: JournalEntry = {
  economicEvents: [],
  marketConditions: "",
  keyLevels: "",
  strategiesFocus: [],
  executionRating: 0,
  mentalState: [],
  mistakes: [],
  lessonsLearned: "",
  notes: "",
};

function makeEvent(): EconomicEvent {
  return {
    id: crypto.randomUUID(),
    time: "",
    name: "",
    forecast: "",
    actual: "",
    impact: "medium",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseEconomicEvents(raw: unknown): EconomicEvent[] {
  if (Array.isArray(raw)) return raw as EconomicEvent[];
  // Backward-compat: old plain string
  if (typeof raw === "string" && raw.trim() !== "") {
    return [{ id: crypto.randomUUID(), time: "", name: raw, forecast: "", actual: "", impact: "medium" }];
  }
  return [];
}

async function readResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text,
    };
  }
}

const impactColors: Record<EconomicEvent["impact"], string> = {
  low:    "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high:   "bg-rose-50 text-rose-700 border-rose-200",
};

// ─── Modal ───────────────────────────────────────────────────────────────────

type JournalEntryModalProps = {
  isOpen: boolean;
  dateStr: string;
  accountId: string;
  onClose: () => void;
  onSaved: () => void;
};

export function JournalEntryModal({ isOpen, dateStr, accountId, onClose, onSaved }: JournalEntryModalProps) {
  const { t, locale } = useTranslation();
  const [journal, setJournal] = useState<JournalEntry>(defaultJournal);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accountId || !dateStr) return;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [journalRes, tradesRes] = await Promise.all([
          fetch(`/api/daily-journal?accountId=${accountId}&date=${dateStr}`),
          fetch(`/api/trades?accountId=${accountId}`)
        ]);

        const [journalPayload, tradesPayload] = await Promise.all([
          readResponsePayload(journalRes),
          readResponsePayload(tradesRes),
        ]);

        if (!journalRes.ok && journalRes.status !== 404) {
          throw new Error(
            (journalPayload && typeof journalPayload === "object" && "error" in journalPayload && typeof journalPayload.error === "string"
              ? journalPayload.error
              : null) || t("journalModal.loadJournalError")
          );
        }
        if (!tradesRes.ok) {
          throw new Error(
            (tradesPayload && typeof tradesPayload === "object" && "error" in tradesPayload && typeof tradesPayload.error === "string"
              ? tradesPayload.error
              : null) || t("journalModal.loadTradesError")
          );
        }

        if (journalPayload && typeof journalPayload === "object" && "journal" in journalPayload && journalPayload.journal) {
          setJournal({
            ...defaultJournal,
            ...journalPayload.journal,
            economicEvents:  parseEconomicEvents(journalPayload.journal.economicEvents),
            strategiesFocus: Array.isArray(journalPayload.journal.strategiesFocus) ? journalPayload.journal.strategiesFocus : [],
            mentalState:     Array.isArray(journalPayload.journal.mentalState)     ? journalPayload.journal.mentalState     : [],
            mistakes:        Array.isArray(journalPayload.journal.mistakes)        ? journalPayload.journal.mistakes        : [],
            marketConditions: journalPayload.journal.marketConditions || "",
            keyLevels:        journalPayload.journal.keyLevels        || "",
            lessonsLearned:   journalPayload.journal.lessonsLearned   || "",
            notes:            journalPayload.journal.notes            || "",
            executionRating:  journalPayload.journal.executionRating  || 0,
          });
        } else {
          setJournal(defaultJournal);
        }

        const allTrades: Trade[] =
          tradesPayload && typeof tradesPayload === "object" && "trades" in tradesPayload && Array.isArray(tradesPayload.trades)
            ? tradesPayload.trades as Trade[]
            : [];
        setTrades(allTrades.filter(t => t.openedAt.startsWith(dateStr)));

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("journalModal.unknownError"));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, accountId, dateStr, t]);

  if (!isOpen) return null;

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!accountId || !dateStr) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/daily-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, date: dateStr, ...journal }),
      });
      const payload = await readResponsePayload(response);
      if (!response.ok) {
        throw new Error(
          (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : null) || t("journalModal.saveError")
        );
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("journalModal.unknownError"));
    } finally {
      setSaving(false);
    }
  }

  // ── Array helpers ─────────────────────────────────────────────────────────

  function toggleArrayItem(field: "strategiesFocus" | "mentalState" | "mistakes", item: string) {
    setJournal(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(item) ? current.filter(i => i !== item) : [...current, item],
      };
    });
  }

  function addEvent() {
    setJournal(prev => ({ ...prev, economicEvents: [...prev.economicEvents, makeEvent()] }));
  }

  function removeEvent(id: string) {
    setJournal(prev => ({ ...prev, economicEvents: prev.economicEvents.filter(e => e.id !== id) }));
  }

  function updateEvent<K extends keyof EconomicEvent>(id: string, key: K, value: EconomicEvent[K]) {
    setJournal(prev => ({
      ...prev,
      economicEvents: prev.economicEvents.map(e => e.id === id ? { ...e, [key]: value } : e),
    }));
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  const dailyPnl   = trades.reduce((sum, t) => sum + Number(t.netPnl || 0), 0);
  const displayDate = new Date(`${dateStr}T12:00:00`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const impactLabels: Record<EconomicEvent["impact"], string> = {
    low: t("journalModal.impactLow"),
    medium: t("journalModal.impactMedium"),
    high: t("journalModal.impactHigh"),
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-surface-1 shadow-2xl ring-1 ring-border"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#2e2e2e] bg-surface-1/80 px-4 py-3 sm:px-6 backdrop-blur-md">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-secondary font-sans">{t("journalModal.title")}</h2>
            <p className="text-lg font-semibold text-primary capitalize">{displayDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-secondary hover:bg-surface-2 hover:text-primary transition-colors font-sans">
              {t("journalModal.cancel")}
            </button>
            <button type="button" onClick={handleSave} disabled={saving || loading}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 font-sans shadow-none border border-[#2e2e2e]">
              {saving ? t("journalModal.saving") : t("journalModal.save")}
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row bg-surface-2/30">

          {/* Left: Editor */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
            <div className="mx-auto max-w-3xl space-y-10">

              {error && (
                <div className="rounded-xl bg-pnl-negative/10 px-4 py-3 text-sm text-pnl-negative border border-pnl-negative/20 font-sans">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20 text-secondary font-sans">
                  <span className="animate-pulse">{t("journalModal.loading")}</span>
                </div>
              ) : (
                <>
                  {/* Free notes */}
                  <textarea
                    value={journal.notes}
                    onChange={e => setJournal({ ...journal, notes: e.target.value })}
                    className="w-full resize-none bg-transparent text-xl font-medium text-primary placeholder:text-secondary/40 outline-none leading-relaxed min-h-[120px]"
                    placeholder={t("journalModal.notesPlaceholder")}
                  />

                  {/* ── Pre-Market ──────────────────────────────────────── */}
                  <div className="space-y-6 rounded-2xl bg-surface-1 p-6 shadow-none border border-[#2e2e2e] border border-[#2e2e2e]/50">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-primary font-sans">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs">🌅</span>
                      {t("journalModal.preMarket")}
                    </h3>

                    {/* ── Economic Events ─────────────────────────────── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">
                          {t("journalModal.economicEvents")}
                        </label>
                        <button
                          type="button"
                          onClick={addEvent}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white shadow-none border border-[#2e2e2e] hover:bg-brand-600 transition-colors font-sans"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          {t("journalModal.addEvent")}
                        </button>
                      </div>

                      {journal.economicEvents.length === 0 && (
                        <button
                          type="button"
                          onClick={addEvent}
                          className="w-full rounded-xl border border-dashed border-[#2e2e2e] py-5 text-sm text-secondary hover:border-brand-400 hover:text-brand-500 transition-colors font-sans"
                        >
                          {t("journalModal.addEventCta")}
                        </button>
                      )}

                      <div className="space-y-3">
                        {journal.economicEvents.map((event, idx) => (
                          <div
                            key={event.id}
                            className="group relative rounded-xl border border-[#2e2e2e] bg-surface-2 p-4 transition-shadow hover:shadow-none border border-[#2e2e2e]"
                          >
                            {/* Row 1: Time + Name + Impact + Delete */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {/* Index badge */}
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                                {idx + 1}
                              </span>

                              {/* Time */}
                              <input
                                type="time"
                                value={event.time}
                                onChange={e => updateEvent(event.id, "time", e.target.value)}
                                className="h-8 rounded-lg border border-[#2e2e2e] bg-surface-1 px-2 text-sm font-mono text-primary outline-none focus:ring-2 focus:ring-brand-500 w-28"
                              />

                              {/* Name */}
                              <input
                                type="text"
                                value={event.name}
                                onChange={e => updateEvent(event.id, "name", e.target.value)}
                                placeholder={t("journalModal.eventName")}
                                className="h-8 flex-1 min-w-[140px] rounded-lg border border-[#2e2e2e] bg-surface-1 px-3 text-sm text-primary placeholder:text-secondary/50 outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                              />

                              {/* Impact selector */}
                              <select
                                value={event.impact}
                                onChange={e => updateEvent(event.id, "impact", e.target.value as EconomicEvent["impact"])}
                                className={`h-8 rounded-lg border px-2 text-xs font-semibold outline-none cursor-pointer font-sans ${impactColors[event.impact]}`}
                              >
                                {(["low", "medium", "high"] as const).map(lvl => (
                                  <option key={lvl} value={lvl}>{impactLabels[lvl]}</option>
                                ))}
                              </select>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => removeEvent(event.id)}
                                className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-pnl-negative/10 hover:text-pnl-negative transition-colors"
                                aria-label={t("journalModal.closeEvent")}
                              >
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Row 2: Forecast vs Actual */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-sans">
                                  {t("journalModal.forecast")}
                                </label>
                                <input
                                  type="text"
                                  value={event.forecast}
                                  onChange={e => updateEvent(event.id, "forecast", e.target.value)}
                                  placeholder={t("journalModal.forecastPlaceholder")}
                                  className="h-9 w-full rounded-lg border border-[#2e2e2e] bg-surface-1 px-3 text-sm font-mono text-primary placeholder:text-secondary/40 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-sans">
                                  {t("journalModal.actual")}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={event.actual}
                                    onChange={e => updateEvent(event.id, "actual", e.target.value)}
                                    placeholder={t("journalModal.actualPlaceholder")}
                                    className={`h-9 w-full rounded-lg border px-3 text-sm font-mono placeholder:text-secondary/40 outline-none focus:ring-2 font-sans transition-colors ${
                                      event.actual
                                        ? "border-pnl-positive/40 bg-pnl-positive/5 text-pnl-positive focus:ring-pnl-positive/30"
                                        : "border-[#2e2e2e] bg-surface-1 text-primary focus:ring-brand-500"
                                    }`}
                                  />
                                  {event.actual && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-pnl-positive">✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Conditions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">
                        {t("journalModal.marketConditions")}
                      </label>
                      <input
                        type="text"
                        value={journal.marketConditions}
                        onChange={e => setJournal({ ...journal, marketConditions: e.target.value })}
                        className="w-full bg-transparent border-b border-[#2e2e2e]/60 px-0 py-2 text-sm text-primary outline-none transition-colors focus:border-brand-500 placeholder:text-secondary/50 font-sans"
                        placeholder={t("journalModal.marketConditionsPlaceholder")}
                      />
                    </div>

                    {/* Key Levels */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">
                        {t("journalModal.keyLevels")}
                      </label>
                      <input
                        type="text"
                        value={journal.keyLevels}
                        onChange={e => setJournal({ ...journal, keyLevels: e.target.value })}
                        className="w-full bg-transparent border-b border-[#2e2e2e]/60 px-0 py-2 text-sm text-primary outline-none transition-colors focus:border-brand-500 placeholder:text-secondary/50 font-sans"
                        placeholder={t("journalModal.keyLevelsPlaceholder")}
                      />
                    </div>
                  </div>

                  {/* ── Execution ───────────────────────────────────────── */}
                  <div className="space-y-6 rounded-2xl bg-surface-1 p-6 shadow-none border border-[#2e2e2e] border border-[#2e2e2e]/50">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-primary font-sans">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs">🎯</span>
                      {t("journalModal.execution")}
                    </h3>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">{t("journalModal.disciplineRating")}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setJournal({ ...journal, executionRating: rating })}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-lg font-bold transition-all duration-200 ${
                              journal.executionRating === rating
                                ? "border-brand-500 bg-brand-500 text-white shadow-none border border-[#2e2e2e] scale-105"
                                : "border-[#2e2e2e] bg-surface-2 text-secondary hover:border-brand-400/50 hover:bg-surface-1"
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">{t("journalModal.strategiesPlayed")}</label>
                      <div className="flex flex-wrap gap-2">
                        {journalStrategies.map((strategy) => (
                          <button
                            key={strategy}
                            type="button"
                            onClick={() => toggleArrayItem("strategiesFocus", strategy)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                              journal.strategiesFocus.includes(strategy)
                                ? "bg-brand-500 border-brand-500 text-white shadow-none border border-[#2e2e2e]"
                                : "bg-surface-2 border-transparent text-secondary hover:text-primary hover:bg-surface-1 hover:border-[#2e2e2e]"
                            }`}
                          >
                            {t(strategyLabelKeys[strategy])}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Psychology ──────────────────────────────────────── */}
                  <div className="space-y-6 rounded-2xl bg-surface-1 p-6 shadow-none border border-[#2e2e2e] border border-[#2e2e2e]/50">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-primary font-sans">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs">🧠</span>
                      {t("journalModal.psychology")}
                    </h3>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">{t("journalModal.mentalState")}</label>
                      <div className="flex flex-wrap gap-2">
                        {journalMentalStates.map((state) => (
                          <button key={state} type="button" onClick={() => toggleArrayItem("mentalState", state)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                              journal.mentalState.includes(state)
                                ? "bg-purple-500 border-purple-500 text-white shadow-none border border-[#2e2e2e]"
                                : "bg-surface-2 border-transparent text-secondary hover:text-primary hover:bg-surface-1 hover:border-[#2e2e2e]"
                            }`}>{t(mentalStateLabelKeys[state])}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-secondary font-sans">{t("journalModal.mistakes")}</label>
                      <div className="flex flex-wrap gap-2">
                        {journalMistakes.map((mistake) => (
                          <button key={mistake} type="button" onClick={() => toggleArrayItem("mistakes", mistake)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                              journal.mistakes.includes(mistake)
                                ? "bg-rose-500 border-rose-500 text-white shadow-none border border-[#2e2e2e]"
                                : "bg-surface-2 border-transparent text-secondary hover:text-primary hover:bg-surface-1 hover:border-[#2e2e2e]"
                            }`}>{t(mistakeLabelKeys[mistake])}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Lessons ─────────────────────────────────────────── */}
                  <div className="space-y-4 rounded-2xl bg-brand-500/5 p-6 border border-brand-500/20">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-600 font-sans">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-white text-xs">💡</span>
                      {t("journalModal.lessons")}
                    </h3>
                    <textarea
                      value={journal.lessonsLearned}
                      onChange={e => setJournal({ ...journal, lessonsLearned: e.target.value })}
                      className="w-full resize-none bg-transparent text-sm text-primary placeholder:text-brand-500/40 outline-none leading-relaxed min-h-[80px] font-sans"
                      placeholder={t("journalModal.lessonsPlaceholder")}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Trades sidebar */}
          <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-[#2e2e2e] bg-surface-1 flex flex-col">
            <div className="p-5 sm:p-6 border-b border-[#2e2e2e] bg-surface-2/30">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 font-sans">{t("journalModal.actualResult")}</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-1">{t("journalModal.netPnl")}</p>
                  <p className={`text-3xl font-black font-mono tracking-tight ${pnlColorClass(dailyPnl)}`}>
                    {dailyPnl > 0 ? "+" : ""}{formatNumber(dailyPnl)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-1">{t("common.trades")}</p>
                  <p className="text-xl font-bold font-mono text-primary">{trades.length}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary font-sans ml-2">{t("journalModal.tradesList")}</h3>
              {trades.length === 0 ? (
                <p className="p-4 text-center text-sm text-secondary font-sans border border-dashed border-[#2e2e2e] rounded-xl">
                  {t("journalModal.noTrades")}
                </p>
              ) : (
                trades.map(trade => (
                  <Link
                    key={trade.id}
                    href={`/trades/${trade.id}`}
                    onClick={onClose}
                    className="block rounded-xl border border-[#2e2e2e] bg-surface-1 p-3 hover:border-brand-500 hover:shadow-none border border-[#2e2e2e] transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-primary group-hover:text-brand-500 transition-colors font-sans">{trade.symbol}</span>
                      <span className={`text-sm font-bold font-mono ${pnlColorClass(Number(trade.netPnl || 0))}`}>
                        {Number(trade.netPnl || 0) > 0 ? "+" : ""}{compactPnl(Number(trade.netPnl || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-secondary font-sans">
                      <span className={`px-1.5 py-0.5 rounded-md font-semibold ${trade.side === "LONG" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                        {trade.side === "LONG" ? t("journalModal.long") : t("journalModal.short")}
                      </span>
                      <span className="font-mono">
                        {new Date(trade.openedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
