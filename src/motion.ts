// Mouvements doux : jamais de flash, jamais de tremblement. Easings = ceux de l'app (--ease-standard) et des variantes plus lentes.
import { Easing, interpolate } from "remotion";

export const STD = Easing.bezier(0.2, 0, 0.2, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Valeur qui passe de `from` à `to` entre les images locales `a` et `b` (bornée). */
export const tw = (f: number, a: number, b: number, from = 0, to = 1, easing: (n: number) => number = OUT) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Pseudo-aléatoire déterministe (même résultat à chaque rendu). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Formate un nombre à la française : 1 284,50 */
export const fmt = (n: number, d = 2) =>
  n
    .toFixed(d)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Format selon la langue : 1 284,50 (fr) ou 1,284.50 (en). */
export const fmtL = (n: number, d: number, lang: "fr" | "en") =>
  lang === "fr" ? fmt(n, d) : n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
