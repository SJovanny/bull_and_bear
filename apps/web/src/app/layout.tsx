import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { TutorialContextProvider } from "@/components/tutorial/tutorial-context";
import { JsonLd } from "@/components/json-ld";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.bullandbear.pro")
  ),
  title: {
    default: "Bull & Bear — Trading Journal & Analytics",
    template: "%s — Bull & Bear",
  },
  description:
    "Track, analyze, and improve your trading performance. Import trades from cTrader, view detailed statistics, and keep a daily trading journal.",
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
    "performance trading",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bullandbear.pro",
    siteName: "Bull & Bear",
    title: "Bull & Bear — Trading Journal & Analytics",
    description:
      "Track, analyze, and improve your trading performance. Import trades, view statistics, and keep a daily journal.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bull & Bear — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bnbearjournal",
    creator: "@bnbearjournal",
    title: "Bull & Bear — Trading Journal & Analytics",
    description:
      "Track, analyze, and improve your trading performance.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="en" — English is the primary server-rendered language indexed by Google.
    // The LanguageProvider updates document.documentElement.lang on the client
    // when a user switches to French via the toggle (stored in localStorage).
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Global JSON-LD structured data — placed in body, fully valid per Google guidelines */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://www.bullandbear.pro/#organization",
            name: "Bull & Bear",
            url: "https://www.bullandbear.pro",
            logo: "https://www.bullandbear.pro/BB_logo.png",
            sameAs: ["https://twitter.com/bnbearjournal"],
            contactPoint: {
              "@type": "ContactPoint",
              email: "bullandbear.journal@gmail.com",
              contactType: "customer support",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Bull & Bear",
            url: "https://www.bullandbear.pro",
            description:
              "Track, analyze, and improve your trading performance. Bull & Bear is the trading journal for serious traders.",
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Bull & Bear",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: "https://www.bullandbear.pro",
            description:
              "A trading journal and analytics platform for day traders and forex traders. Track trades, review statistics, and keep a daily trading journal. Supports cTrader and MetaTrader imports.",
            screenshot: "https://www.bullandbear.pro/dashboard_example.png",
          }}
        />
        <LanguageProvider>
          <TutorialContextProvider>
            {children}
          </TutorialContextProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
