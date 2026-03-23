import type { TranslationKeys } from "@/lib/i18n/types";

export const journalStrategies = [
  "Breakout",
  "Pullback",
  "Reversal",
  "Trend Following",
  "Scalp",
  "Range",
] as const;

export const journalMentalStates = [
  "Calm",
  "Focused",
  "Tired",
  "Anxious",
  "FOMO",
  "Tilt",
  "Overconfident",
] as const;

export const journalMistakes = [
  "Overtrading",
  "Revenge Trading",
  "Moved Stop Loss",
  "Forced Entry",
  "Too Large Size",
  "Hesitated",
] as const;

export type JournalStrategy = (typeof journalStrategies)[number];
export type JournalMentalState = (typeof journalMentalStates)[number];
export type JournalMistake = (typeof journalMistakes)[number];

export const strategyLabelKeys: Record<JournalStrategy, keyof TranslationKeys> = {
  Breakout: "journalModal.strategyBreakout",
  Pullback: "journalModal.strategyPullback",
  Reversal: "journalModal.strategyReversal",
  "Trend Following": "journalModal.strategyTrendFollowing",
  Scalp: "journalModal.strategyScalp",
  Range: "journalModal.strategyRange",
};

export const mentalStateLabelKeys: Record<JournalMentalState, keyof TranslationKeys> = {
  Calm: "journalModal.mentalCalm",
  Focused: "journalModal.mentalFocused",
  Tired: "journalModal.mentalTired",
  Anxious: "journalModal.mentalAnxious",
  FOMO: "journalModal.mentalFomo",
  Tilt: "journalModal.mentalTilt",
  Overconfident: "journalModal.mentalOverconfident",
};

export const mistakeLabelKeys: Record<JournalMistake, keyof TranslationKeys> = {
  Overtrading: "journalModal.mistakeOvertrading",
  "Revenge Trading": "journalModal.mistakeRevengeTrading",
  "Moved Stop Loss": "journalModal.mistakeMovedStopLoss",
  "Forced Entry": "journalModal.mistakeForcedEntry",
  "Too Large Size": "journalModal.mistakeTooLargeSize",
  Hesitated: "journalModal.mistakeHesitated",
};
