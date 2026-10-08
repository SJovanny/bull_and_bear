// Tous les textes de la pub, par langue. Les écrans du téléphone restent en anglais dans les deux versions (c'est l'interface réelle de l'app).
// Le slogan anglais est celui de la landing (en.ts : « Trade. Review. Grow. »).
import type { Lang } from "./timings";

export interface Copy {
  matter: { l1a: string; l1b: string; l2: string };
  kinetic: { l1: string; l2: string; l3: string; accent: string; why: string };
  phone: { c1: [string, string]; c2: [string, string]; c3: [string, string]; c4: [string, string]; pnl: string };
  paths: { autoTag: string; oneClickTag: string; autoTitle: string; autoSub: string; one: string; same: string };
  layers: { title: [string, string]; calendar: string; trades: string; daily: string; curve: string; kpi: string };
  cards: { journal: [string, string]; chart: [string, string]; calendar: [string, string]; stats: [string, string] };
  route: { l1: string; l2: string; accent: string; steps: [string, string, string, string]; loop: string };
  numbers: { title: [string, string]; win: string; pf: string; dd: string; example: string; exampleTarget: string; strip: { v: string; l: string }[] };
  logo: { cta: string; legal: string };
  legal: string;
}

export const COPY: Record<Lang, Copy> = {
  fr: {
    matter: { l1a: "Tradez.", l1b: "Analysez.", l2: "Grandissez." },
    kinetic: { l1: "Sans journal,", l2: "les mêmes erreurs.", l3: "les mêmes pertes.", accent: "pertes", why: "pourquoi ?" },
    phone: {
      c1: ["Connectez votre compte", "cTrader, en un clic"],
      c2: ["Autorisez", "Lecture seule : aucun ordre, aucune modification."],
      c3: ["Synchronisé", "Vos trades arrivent tout seuls."],
      c4: ["Votre courbe", "enfin toute l'histoire."],
      pnl: "PnL net",
    },
    paths: { autoTag: "Automatique", oneClickTag: "En un clic", autoTitle: "Synchronisation automatique", autoSub: "Connectez-vous une fois, c'est tout.", one: "Un seul journal.", same: "Mêmes statistiques." },
    layers: { title: ["Tout au", "même endroit."], calendar: "Calendrier", trades: "Derniers trades", daily: "PnL journalier", curve: "Courbe de PnL", kpi: "Performances" },
    cards: {
      journal: ["Journal d'exécution", "Notes, captures d'écran, erreurs et émotions."],
      chart: ["Revue graphique", "Le graphique, tel qu'il était au moment du trade."],
      calendar: ["Calendrier", "Vos jours gagnants et perdants d'un coup d'œil."],
      stats: ["Statistiques avancées", "Win rate, profit factor, drawdown, espérance."],
    },
    route: { l1: "Trade après trade,", l2: "vous gagnez en ", accent: "discipline.", steps: ["Trade", "Note", "Analyse", "Ajustement"], loop: "Une boucle qui s'améliore." },
    numbers: {
      title: ["Des chiffres ", "clairs."],
      win: "Win rate",
      pf: "Profit factor",
      dd: "Drawdown max",
      example: "exemple",
      exampleTarget: "exemple · objectif ≥ 1,5",
      strip: [
        { v: "0 €", l: "pour commencer" },
        { v: "2", l: "plateformes : cTrader + MetaTrader" },
        { v: "∞", l: "marge de progression" },
      ],
    },
    logo: { cta: "Commencer gratuitement", legal: "Données de démonstration. Le trading comporte des risques de perte en capital ; les performances passées ne préjugent pas des performances futures." },
    legal: "Données de démonstration — résultats non garantis. Le trading comporte des risques de perte en capital.",
  },
  en: {
    matter: { l1a: "Trade.", l1b: "Review.", l2: "Grow." },
    kinetic: { l1: "Without a journal,", l2: "the same mistakes.", l3: "the same losses.", accent: "losses", why: "why?" },
    phone: {
      c1: ["Connect your account", "cTrader, in one click"],
      c2: ["Authorize", "Read-only: no orders, no changes."],
      c3: ["Synced", "Your trades arrive on their own."],
      c4: ["Your curve", "finally tells the whole story."],
      pnl: "Net PnL",
    },
    paths: { autoTag: "Automatic", oneClickTag: "One click", autoTitle: "Automatic sync", autoSub: "Connect once, that's it.", one: "One journal.", same: "Same stats." },
    layers: { title: ["Everything in", "one place."], calendar: "Calendar", trades: "Recent trades", daily: "Daily PnL", curve: "PnL curve", kpi: "Performance" },
    cards: {
      journal: ["Execution journal", "Notes, screenshots, mistakes and emotions."],
      chart: ["Chart review", "The chart, exactly as it was when you traded."],
      calendar: ["Calendar", "Your winning and losing days at a glance."],
      stats: ["Advanced statistics", "Win rate, profit factor, drawdown, expectancy."],
    },
    route: { l1: "Trade after trade,", l2: "you build ", accent: "discipline.", steps: ["Trade", "Note", "Analyze", "Adjust"], loop: "A loop that keeps improving." },
    numbers: {
      title: ["Clear ", "numbers."],
      win: "Win rate",
      pf: "Profit factor",
      dd: "Max drawdown",
      example: "example",
      exampleTarget: "example · target ≥ 1.5",
      strip: [
        { v: "0 €", l: "to get started" },
        { v: "2", l: "platforms: cTrader + MetaTrader" },
        { v: "∞", l: "room to improve" },
      ],
    },
    logo: { cta: "Get started for free", legal: "Demo data. Trading involves a risk of capital loss; past performance does not guarantee future results." },
    legal: "Demo data — results not guaranteed. Trading involves a risk of capital loss.",
  },
};
