import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "Bull & Bear — Trading Journal",
    short_name: "Bull & Bear",
    description: "Trading journal & analytics: track your trades and keep a daily journal.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0B1220",
    theme_color: "#3B82F6",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Journal", url: "/journal", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Trades", url: "/trades", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
