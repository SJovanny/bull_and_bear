import type { Metadata } from "next";
import LandingPage from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Bull & Bear — Trading Journal & Performance Analytics",
  description:
    "Track every trade, analyze your performance, and become a better trader. Bull & Bear is the trading journal built for serious day traders. Supports cTrader, MetaTrader & CSV imports.",
  keywords: [
    "trading journal",
    "trade tracker",
    "trading analytics",
    "day trading journal",
    "forex trading journal",
    "stock trading tracker",
    "trading performance",
    "cTrader journal",
    "MetaTrader journal",
    "journal de trading",
    "suivi de trades",
    "analyse trading",
  ],
  alternates: {
    canonical: "https://bullandbear.pro",
  },
  openGraph: {
    title: "Bull & Bear — Trading Journal & Performance Analytics",
    description:
      "Track every trade, analyze your performance, and become a better trader. Free 14-day trial. Supports cTrader & MetaTrader imports.",
    url: "https://bullandbear.pro",
  },
};

export default function Page() {
  return <LandingPage />;
}
