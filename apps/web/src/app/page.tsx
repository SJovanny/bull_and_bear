import type { Metadata } from "next";
import LandingPage from "@/components/landing/landing-page";
import { en } from "@/lib/i18n/translations/en";

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
    canonical: "https://www.bullandbear.pro",
  },
  openGraph: {
    title: "Bull & Bear — Trading Journal & Performance Analytics",
    description:
      "Track every trade, analyze your performance, and become a better trader. Free 14-day trial. Supports cTrader & MetaTrader imports.",
    url: "https://www.bullandbear.pro",
    type: "website",
    siteName: "Bull & Bear",
    images: [{ url: "https://www.bullandbear.pro/og-image.png", width: 1200, height: 630, alt: "Bull & Bear — Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bull & Bear — Trading Journal & Performance Analytics",
    description:
      "Track every trade, analyze your performance, and become a better trader. Free 14-day trial. Supports cTrader & MetaTrader imports.",
    images: ["https://www.bullandbear.pro/og-image.png"],
  },
};

/**
 * Server-rendered SEO content block.
 * Visually hidden (sr-only) but fully readable by Googlebot in the initial HTML.
 * The client LandingPage renders the same content visually with animations.
 */
function SeoContent() {
  const features = [
    { title: en["landing.features.journal.title"], desc: en["landing.features.journal.desc"] },
    { title: en["landing.features.calendar.title"], desc: en["landing.features.calendar.desc"] },
    { title: en["landing.features.stats.title"], desc: en["landing.features.stats.desc"] },
    { title: en["landing.features.accounts.title"], desc: en["landing.features.accounts.desc"] },
    { title: en["landing.features.import.title"], desc: en["landing.features.import.desc"] },
    { title: en["landing.features.darkMode.title"], desc: en["landing.features.darkMode.desc"] },
  ];

  return (
    <div className="sr-only" aria-hidden="false">
      <h1>{en["landing.hero.punchline1"]} {en["landing.hero.punchline2"]}</h1>
      <p>{en["landing.hero.subtitle"]}</p>
      <h2>{en["landing.about.title"]}</h2>
      <p>{en["landing.about.hook"]}</p>
      <p>{en["landing.about.body1"]}</p>
      <p>{en["landing.about.body2"]}</p>
      <h2>{en["landing.features.title"]}</h2>
      <p>{en["landing.features.subtitle"]}</p>
      <ul>
        {features.map((f) => (
          <li key={f.title}>
            <strong>{f.title}</strong>: {f.desc}
          </li>
        ))}
      </ul>
      <h2>{en["landing.integrations.title"]}</h2>
      <p>{en["landing.integrations.description"]}</p>
      <h2>{en["landing.cta.headline"]}</h2>
      <p>{en["landing.cta.subtitle"]}</p>
      <h2>{en["landing.contact.title"]}</h2>
      <p>{en["landing.contact.description"]}</p>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <SeoContent />
      <LandingPage />
    </>
  );
}
