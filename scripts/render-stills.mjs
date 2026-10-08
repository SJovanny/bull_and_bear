// Rend des images clés de la composition « Ad » (aucun MP4) : un seul bundle, un seul navigateur.
// Usage : node scripts/render-stills.mjs [--comp=Ad|AdEn] [--out=dossier] [préfixe ...]   (ex. : node scripts/render-stills.mjs --comp=AdEn 03 04)
// Ad = version française -> out/stills ; AdEn = version anglaise -> out/stills-en.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const FPS = 30;
// nom, instant GLOBAL en secondes. Un nom = un chapitre (préfixe = numéro de ligne de voix) ; plusieurs images par chapitre si utile.
export const KEYS = [
  ["01a-matiere", 1.2],
  ["01b-titre", 4.2],
  ["02a-typo", 7.8],
  ["02b-pourquoi", 10.4],
  ["03a-telephone-entree", 12.0],
  ["03b-zoom-compte", 14.3],
  ["03c-modal", 16.2],
  ["03d-autorisation", 17.5],
  ["03e-connecte", 19.4],
  ["04a-synchro", 20.6],
  ["04b-courbe", 23.5],
  ["04c-pnl", 25.6],
  ["04d-dezoom", 27.3],
  ["05a-chemins", 29.6],
  ["05b-metatrader", 31.4],
  ["05c-fusion", 32.6],
  ["06a-calques", 34.2],
  ["06b-calques-eclates", 36.4],
  ["07a-cartes", 40.0],
  ["07b-cartes", 42.2],
  ["08a-parcours", 44.5],
  ["08b-parcours", 46.5],
  ["09a-chiffres", 48.4],
  ["09b-chiffres", 49.7],
  ["10a-logo", 51.6],
  ["10b-final", 53.6],
];

const args = process.argv.slice(2);
const comp = (args.find((a) => a.startsWith("--comp=")) ?? "--comp=Ad").slice(7);
const out = (args.find((a) => a.startsWith("--out=")) ?? `--out=${comp === "AdEn" ? "out/stills-en" : "out/stills"}`).slice(6);
const only = args.filter((a) => !a.startsWith("--"));

mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp });
for (const [name, seconds] of KEYS) {
  if (only.length && !only.some((o) => name.startsWith(o))) continue;
  const frame = Math.min(composition.durationInFrames - 1, Math.round(seconds * FPS));
  const output = path.join(out, `${name}.png`);
  await renderStill({ composition, serveUrl, output, frame, imageFormat: "png" });
  console.log("ok", output, `(image ${frame})`);
}
