// Couleurs et polices reprises de apps/web/src/app/globals.css (thème sombre) et de layout.tsx.
import { loadFont as loadSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: "#0F172A",
  bgDeep: "#0A1020",
  surface1: "#111827",
  surface2: "#1F2937",
  border: "#334155",
  text: "#E5E7EB",
  text2: "#94A3B8",
  brand: "#3B82F6",
  brand600: "#2563EB",
  teal: "#14B8A6",
  pos: "#10B981",
  neg: "#EF4444",
  warn: "#F59E0B",
} as const;

const sans = loadSans("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const mono = loadMono("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });

export const SANS = sans.fontFamily;
export const MONO = mono.fontFamily;

/** Secondes -> images. */
export const sec = (s: number) => Math.round(s * FPS);
