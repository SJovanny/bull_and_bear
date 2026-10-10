// Sous-titres incrustés, dans la langue de la voix (la plupart des gens regardent sans le son). Calés sur les lignes de voix de timings.ts :
// chaque ligne est découpée en groupes de 2 à 5 mots, répartis sur la durée de la ligne (mesurée si `dur` est renseigné, estimée sinon).
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useStage } from "./stage";
import { C, SANS } from "./tokens";
import { tw } from "./motion";
import { useTimings } from "./lang";
import type { VoiceLine } from "./timings";

const WORDS_PER_SEC = 2.6;
const MAX_WORDS = 8; // une proposition jusqu'à 8 mots reste sur une seule ligne
const SPLIT_TO = 6; // au-delà, on la coupe en parts égales d'au plus 6 mots

/** Découpe une phrase en groupes courts : d'abord aux signes de ponctuation, puis les propositions trop longues en parts égales. */
export const chunkText = (text: string): string[] => {
  const clauses = (text.match(/[^.,:;?!]+[.,:;?!]?\s*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
  const count = (s: string) => s.split(/\s+/).length;
  // une proposition d'un seul mot se colle à la suivante
  const merged: string[] = [];
  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i];
    if (count(c) < 2 && i < clauses.length - 1) clauses[i + 1] = `${c} ${clauses[i + 1]}`;
    else merged.push(c);
  }
  return merged.flatMap((c) => {
    const words = c.split(/\s+/);
    if (words.length <= MAX_WORDS) return [c];
    const parts = Math.ceil(words.length / SPLIT_TO);
    const size = Math.ceil(words.length / parts);
    return Array.from({ length: parts }, (_, i) => words.slice(i * size, (i + 1) * size).join(" ")).filter(Boolean);
  });
};

export interface Cue { from: number; to: number; text: string }

/** Sous-titres d'une ligne de voix : durée répartie au prorata des caractères, jamais au-delà du début de la ligne suivante (`limit`). */
export const cuesFor = (line: VoiceLine, limit: number): Cue[] => {
  const chunks = chunkText(line.text);
  const dur = Math.min(line.dur ?? line.text.split(/\s+/).length / WORDS_PER_SEC, limit - line.at - 0.35);
  const weights = chunks.map((c) => c.length + (/[.?!]$/.test(c) ? 6 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let t = line.at;
  return chunks.map((text, i) => {
    const from = t;
    t += (weights[i] / total) * dur;
    return { from, to: i === chunks.length - 1 ? t + 0.25 : t, text };
  });
};

export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v } = useStage();
  const { voice, totalSec } = useTimings();
  const now = f / fps;
  const cues = voice.flatMap((line, i) => cuesFor(line, voice[i + 1]?.at ?? totalSec));
  const i = cues.findIndex((c) => now >= c.from && now < c.to);
  if (i < 0) return null;
  const cue = cues[i];
  // fondu d'entrée court ; fondu de sortie seulement s'il n'y a pas de groupe qui suit immédiatement (sinon : pas de trou entre deux groupes)
  const followed = cues[i + 1] && cues[i + 1].from - cue.to < 0.06;
  const p = tw(now, cue.from, cue.from + 0.1) * (followed ? 1 : 1 - tw(now, cue.to - 0.1, cue.to));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: v ? 250 : 72, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none", opacity: p }}>
      <div style={{ maxWidth: v ? 940 : 1500, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: v ? 56 : 46, lineHeight: 1.2, letterSpacing: "-0.02em", color: "#fff", background: "rgba(10,16,32,0.74)", border: `1px solid ${C.border}`, borderRadius: 18, padding: "10px 26px", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
        {cue.text}
      </div>
    </div>
  );
};
