// Chronologie de la pub, PAR LANGUE (la voix anglaise n'a pas la même durée que la française).
// Durées des chapitres en secondes ; ancres d'animation en secondes DEPUIS LE DÉBUT DU CHAPITRE ; lignes de voix posées en secondes absolues.
// Quand les voix ElevenLabs seront là : on mesure chaque ligne (`dur`), on décale les ancres sur les mots et on ajuste les durées ici.
import { sec } from "./tokens";

export type Lang = "fr" | "en";

export type ChapterId =
  | "matiere" | "typo" | "telephone" | "chemins" | "calques" | "cartes" | "parcours" | "chiffres" | "logo";

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

const CHAPTERS: { id: ChapterId; from: number; dur: number }[] = [
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
  logo: { b1: 0.1, b2: 0.5, name: 1.5, cta: 2.2 },
};
export type Anchors = typeof ANCHORS;

// ── Voix off : `text` = ce qu'affichent les sous-titres (orthographe réelle). Les fichiers VOIX-OFF*.txt, eux, sont écrits pour la prononciation ElevenLabs.
// Une ligne par chapitre (un fichier ElevenLabs chacune : public/voix/NN.mp3 en français, public/voix-en/NN.mp3 en anglais)
const VOICE_FR: VoiceLine[] = [
  { id: "01", at: 0.3, text: "Chaque trade a quelque chose à vous apprendre." },
  { id: "02", at: 5.3, text: "Mais sans journal, vous refaites les mêmes erreurs. Les mêmes pertes. Sans jamais savoir pourquoi." },
  { id: "03", at: 11.3, text: "Alors faisons simple. Connectez votre compte cTrader, en quelques clics. Vos trades se synchronisent tout seuls." },
  { id: "04", at: 20.3, text: "Plus de saisie. Plus d'oubli. Juste votre courbe, et votre PnL, qui racontent enfin toute l'histoire." },
  { id: "05", at: 28.3, text: "Sur MetaTrader ? Exportez votre historique, glissez le fichier. Les doublons sont écartés pour vous." },
  { id: "06", at: 33.3, text: "Dans Bull & Bear, tout est au même endroit : performances, calendrier, statistiques." },
  { id: "07", at: 38.3, text: "Notez vos setups, vos émotions, vos erreurs. Revoyez chaque graphique, tel qu'il était." },
  { id: "08", at: 43.3, text: "Trade après trade, vous gagnez en discipline." },
  { id: "09", at: 47.3, text: "Des chiffres clairs. Pour décider mieux." },
  { id: "10", at: 50.3, text: "Bull & Bear. Le journal qui vous aide à devenir plus rentable. Commencez gratuitement." },
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

const build = (voice: VoiceLine[]) => {
  const last = CHAPTERS[CHAPTERS.length - 1];
  const totalSec = last.from + last.dur;
  return { chapters: CHAPTERS, A: ANCHORS, voice, totalSec, totalFrames: sec(totalSec) };
};

export const TIMINGS: Record<Lang, ReturnType<typeof build>> = { fr: build(VOICE_FR), en: build(VOICE_EN) };

/** Début d'un chapitre, en secondes. */
export const chapterStart = (lang: Lang, id: ChapterId) => TIMINGS[lang].chapters.find((c) => c.id === id)!.from;
