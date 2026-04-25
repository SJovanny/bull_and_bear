// ============================================================================
// TUTORIAL STEPS - Per-page guided tour steps configuration
// ============================================================================

import type { Step } from "react-joyride";

export type TutorialPage =
  | "dashboard"
  | "calendar"
  | "journal"
  | "stats"
  | "comptes"
  | "profil";

// ─── Dashboard ──────────────────────────────────────────────────────────────
const dashboardSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.dashboard.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="period-selector"]',
    content: "tutorial.dashboard.period",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="kpi-cards"]',
    content: "tutorial.dashboard.kpi",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="charts"]',
    content: "tutorial.dashboard.charts",
    placement: "top",
  },
  {
    target: '[data-tutorial="recent-trades"]',
    content: "tutorial.dashboard.recentTrades",
    placement: "top",
  },
  {
    target: '[data-tutorial="mini-calendar"]',
    content: "tutorial.dashboard.miniCalendar",
    placement: "top",
  },
];

// ─── Calendar ───────────────────────────────────────────────────────────────
const calendarSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.calendar.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="calendar-grid"]',
    content: "tutorial.calendar.grid",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="calendar-actions"]',
    content: "tutorial.calendar.actions",
    placement: "bottom",
  },
];

// ─── Journal ────────────────────────────────────────────────────────────────
const journalSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.journal.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="journal-list"]',
    content: "tutorial.journal.list",
    placement: "top",
  },
  {
    target: '[data-tutorial="journal-actions"]',
    content: "tutorial.journal.actions",
    placement: "bottom",
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────────
const statsSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.stats.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="stats-metrics"]',
    content: "tutorial.stats.metrics",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="stats-breakdown"]',
    content: "tutorial.stats.breakdown",
    placement: "top",
  },
  {
    target: '[data-tutorial="stats-distribution"]',
    content: "tutorial.stats.distribution",
    placement: "top",
  },
];

// ─── Comptes (Accounts) ─────────────────────────────────────────────────────
const comptesSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.comptes.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="accounts-list"]',
    content: "tutorial.comptes.list",
    placement: "top",
  },
  {
    target: '[data-tutorial="accounts-add"]',
    content: "tutorial.comptes.add",
    placement: "bottom",
  },
];

// ─── Profil ─────────────────────────────────────────────────────────────────
const profilSteps: Step[] = [
  {
    target: "body",
    content: "tutorial.profil.welcome",
    placement: "center",
  },
  {
    target: '[data-tutorial="profile-identity"]',
    content: "tutorial.profil.identity",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="profile-overview"]',
    content: "tutorial.profil.overview",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="tutorial-section"]',
    content: "tutorial.profil.tutorials",
    placement: "top",
  },
];

// ─── Exports ────────────────────────────────────────────────────────────────

export const tutorialStepsMap: Record<TutorialPage, Step[]> = {
  dashboard: dashboardSteps,
  calendar: calendarSteps,
  journal: journalSteps,
  stats: statsSteps,
  comptes: comptesSteps,
  profil: profilSteps,
};

export const tutorialPageLabels: Record<TutorialPage, { fr: string; en: string }> = {
  dashboard: { fr: "Dashboard", en: "Dashboard" },
  calendar: { fr: "Calendrier", en: "Calendar" },
  journal: { fr: "Journal", en: "Journal" },
  stats: { fr: "Statistiques", en: "Statistics" },
  comptes: { fr: "Comptes", en: "Accounts" },
  profil: { fr: "Profil", en: "Profile" },
};

export const tutorialPageRoutes: Record<TutorialPage, string> = {
  dashboard: "/dashboard",
  calendar: "/calendar",
  journal: "/journal",
  stats: "/stats",
  comptes: "/comptes",
  profil: "/profil",
};

export const ALL_TUTORIAL_PAGES: TutorialPage[] = [
  "dashboard",
  "calendar",
  "journal",
  "stats",
  "comptes",
  "profil",
];
