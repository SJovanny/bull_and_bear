// Chronologie de la pub, PAR LANGUE (la voix anglaise n'a pas la même durée que la française).
// Durées des chapitres en secondes ; ancres d'animation en secondes DEPUIS LE DÉBUT DU CHAPITRE ; lignes de voix posées en secondes absolues.
// Quand les voix ElevenLabs seront là : on mesure chaque ligne (`dur`), on décale les ancres sur les mots et on ajuste les durées ici.
import { sec } from "./tokens";

export type Lang = "fr" | "en";

export type ChapterId =
  | "matiere" | "typo" | "telephone" | "chemins" | "calques" | "cartes" | "parcours" | "chiffres" | "journal" | "revue" | "installer" | "logo";

export interface VoiceLine {
  id: string;
  /** Début de la ligne, en secondes (absolu). */
  at: number;
  /** Durée MESURÉE du fichier audio, en secondes ; absente = estimée d'après le nombre de mots (≈ 2,6 mots/s). */
  dur?: number;
  text: string;
}

/** Recouvrement (en images) entre deux chapitres : fondu enchaîné doux. */
export const OVERLAP = 9;

type Chapter = { id: ChapterId; from: number; dur: number };

/** Chapitres EN : durées provisoires (la voix anglaise n'est pas encore là). */
const CHAPTERS_EN: Chapter[] = [
  { id: "matiere", from: 0, dur: 5 },
  { id: "typo", from: 5, dur: 6 },
  { id: "telephone", from: 11, dur: 17 }, // chapitres 3 et 4 : un seul plan continu sur le téléphone
  { id: "chemins", from: 28, dur: 5 },
  { id: "calques", from: 33, dur: 5 },
  { id: "cartes", from: 38, dur: 5 },
  { id: "parcours", from: 43, dur: 4 },
  { id: "chiffres", from: 47, dur: 3 },
  { id: "logo", from: 50, dur: 4 },
];

/** Chapitres FR (≈ 29,4 s) : 9 lignes de voix (ElevenLabs v4, silences rognés, jouées à 1,08×).  */
const CHAPTERS_FR: Chapter[] = [
  { id: "matiere", from: 0, dur: 2 }, // 1 : l'accroche
  { id: "typo", from: 2, dur: 6.2 }, // 2 et 3 : pas de journal, Notion abandonné
  { id: "telephone", from: 8.2, dur: 4.1 }, // 4 : cTrader, la courbe et le PnL en accéléré
  { id: "chemins", from: 12.3, dur: 3 }, // 5 : MetaTrader
  { id: "revue", from: 15.3, dur: 2.2 }, // 6 : revoir le trade sur le graphique TradingView
  { id: "journal", from: 17.5, dur: 4.3 }, // 7 : courbe, PnL, erreurs — la fiche de trade (mock)
  { id: "installer", from: 21.8, dur: 3.7 }, // 8 : installer l'app depuis le site
  { id: "logo", from: 25.14, dur: 5.23 }, // 9 : Bull and Bear, le journal de trading fait pour toi
];

// ── Ancres par chapitre (secondes locales) ──────────────────────────────────────────────────────────────────────────────
const ANCHORS = {
  matiere: { w1: 0.4, w2: 1.2, w3: 2.0, trend: 1.0 },
  typo: { l1: 0.2, l2: 1.3, l3: 2.5, why: 4.0 },
  telephone: {
    enter: 0,
    zoomIn: 1.0,
    tapConnect: 3.4, // « Connect cTrader for auto-sync »
    modal: 3.6,
    tapGo: 5.3, // « Connect with cTrader »
    auth: 5.5,
    tapAllow: 6.8,
    linking: 7.1,
    done: 8.0,
    tapDone: 8.8,
    synced: 9.2, // la carte du compte affiche « Resync » et les trades importés
    tapDash: 10.0,
    dash: 10.3,
    chart: 10.8, // la courbe se trace
    chartEnd: 14.8,
    pnl: 10.8, // le PnL monte
    pnlEnd: 15.0,
    zoomOut: 15.4,
  },
  chemins: { left: 0.2, right: 0.9, file: 1.4, preview: 2.2, tapImport: 3.7, merge: 4.0 },
  calques: { split: 0.5, labels: 1.6, settle: 4.0 },
  cartes: { c1: 0.3, c2: 1.2, c3: 2.1, c4: 3.0 },
  parcours: { draw: 0.2, drawEnd: 3.0, label1: 0.6, label2: 1.4, label3: 2.2, label4: 3.0 },
  chiffres: { win: 0.2, pf: 0.7, dd: 1.2, strip: 1.7 },
  logo: { b1: 0.1, b2: 0.5, name: 1.5, tag: 2.0, cta: 2.7 },
  // installer (PWA) : tap sur « Installer l'application », l'icône se pose sur l'écran d'accueil
  installer: { tap: 0.9, home: 1.3, icon: 1.5, cap1: 0.2, cap2: 2.1 },
  // revue (graphique TradingView du trade)
  revue: { card: 0, candles: 0.1, candlesEnd: 1.3, entry: 0.8, exit: 1.3, tag: 1.7 },
  // journal (version courte FR) : calé sur « Ta courbe. Ton PnL. Tes erreurs. Enfin, tu vois tout. »
  journal: { card: 0, curve: 0.1, curveEnd: 1.0, pnl: 1.0, pnlEnd: 1.8, setup: 1.2, emo: 1.9, note: 2.3, noteEnd: 3.7, tag: 2.7, all: 3.0 },
};
export type Anchors = typeof ANCHORS;

/** Ancres FR : celles de la version longue, resserrées chapitre par chapitre (facteur sur les secondes locales). */
const squeeze = (k: Partial<Record<keyof Anchors, number>>): Anchors => {
  const out: Record<string, Record<string, number>> = {};
  for (const [id, anchors] of Object.entries(ANCHORS)) {
    const f = k[id as keyof Anchors] ?? 1;
    out[id] = Object.fromEntries(Object.entries(anchors).map(([n, v]) => [n, +(v * f).toFixed(2)]));
  }
  return out as Anchors;
};
const ANCHORS_FR: Anchors = {
  ...squeeze({ matiere: 0.6, telephone: 0.25, chemins: 0.55 }),
  // logo : « Bull and Bear » (0 s) · « Le journal de trading fait pour toi » (≈ 1,3 s) · « Commence gratuitement » (≈ 3,3 s)
  logo: { b1: 0.1, b2: 0.4, name: 0.8, tag: 1.4, cta: 3.3 },
  // typo : « Pas de journal » (ligne 2), « Notion » (ligne 3 à 2,5 s), « t'as arrêté », puis « pourquoi ? »
  typo: { l1: 0.2, l2: 2.5, l3: 4.0, why: 5.2 },
  // revue : les bougies se posent pendant « Revois chaque trade… », l'entrée puis la sortie
  revue: { card: 0, candles: 0.1, candlesEnd: 1.1, entry: 0.7, exit: 1.1, tag: 1.5 },
};

// ── Voix off : `text` = ce qu'affichent les sous-titres (orthographe réelle). Les fichiers VOIX-OFF*.txt, eux, sont écrits pour la prononciation ElevenLabs.
// Une ligne par chapitre (un fichier ElevenLabs chacune : public/voix/NN.mp3 en français, public/voix-en/NN.mp3 en anglais)
const VOICE_FR: VoiceLine[] = [
  { id: "01", at: 0.15, dur: 1.84, text: "T'as encore cramé un compte, pas vrai ?" },
  { id: "02", at: 2.11, dur: 2.3, text: "Pas de journal. Et tu t'étonnes de perdre ?" },
  { id: "03", at: 4.53, dur: 3.59, text: "Notion ? T'as essayé. T'as arrêté au bout d'une semaine." },
  { id: "04", at: 8.24, dur: 3.99, text: "Avec Bull & Bear, branche cTrader : tes trades arrivent tout seuls." },
  { id: "05", at: 12.35, dur: 2.82, text: "Sur MetaTrader ? Glisse ton fichier. C'est fait." },
  { id: "06", at: 15.29, dur: 2.12, text: "Revois chaque trade sur le graphique TradingView." },
  { id: "07", at: 17.53, dur: 4.17, text: "Ta courbe. Ton PnL. Tes erreurs. Enfin, tu vois tout." },
  { id: "08", at: 21.82, dur: 3.25, text: "Installe l'appli depuis le site : ton journal te suit partout." },
  { id: "09", at: 25.19, dur: 4.73, text: "Bull & Bear. Le journal de trading fait pour toi. Commence gratuitement." },
];

const VOICE_EN: VoiceLine[] = [
  { id: "01", at: 0.3, text: "Every trade has something to teach you." },
  { id: "02", at: 5.3, text: "But without a journal, you repeat the same mistakes. The same losses. Never knowing why." },
  { id: "03", at: 11.3, text: "So let's keep it simple. Connect your cTrader account in a few clicks. Your trades sync on their own." },
  { id: "04", at: 20.3, text: "No more manual entry. No more forgetting. Just your curve, and your PnL, finally telling the whole story." },
  { id: "05", at: 28.3, text: "On MetaTrader? Export your history, drop the file. Duplicates are skipped for you." },
  { id: "06", at: 33.3, text: "In Bull & Bear, everything lives in one place: performance, calendar, statistics." },
  { id: "07", at: 38.3, text: "Log your setups, your emotions, your mistakes. Review every chart, exactly as it was." },
  { id: "08", at: 43.3, text: "Trade after trade, you build discipline." },
  { id: "09", at: 47.3, text: "Clear numbers. For better decisions." },
  { id: "10", at: 50.3, text: "Bull & Bear. The journal that helps you become a more profitable trader. Get started for free." },
];

const build = (CHAPTERS: Chapter[], A: Anchors, voice: VoiceLine[]) => {
  const last = CHAPTERS[CHAPTERS.length - 1];
  const totalSec = last.from + last.dur;
  return { chapters: CHAPTERS, A, voice, totalSec, totalFrames: sec(totalSec) };
};

export const TIMINGS: Record<Lang, ReturnType<typeof build>> = { fr: build(CHAPTERS_FR, ANCHORS_FR, VOICE_FR), en: build(CHAPTERS_EN, ANCHORS, VOICE_EN) };

/** Début d'un chapitre, en secondes. */
export const chapterStart = (lang: Lang, id: ChapterId) => TIMINGS[lang].chapters.find((c) => c.id === id)!.from;
