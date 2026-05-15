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
      : "https://bullandbear.pro")
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
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: "https://bullandbear.pro",
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
    icon: "/BB_logo.png",
    shortcut: "/BB_logo.png",
    apple: "/BB_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default lang="fr" matches the server-side initial locale in LanguageProvider.
    // The LanguageProvider updates document.documentElement.lang on the client
    // once the user's saved preference is loaded from localStorage.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Bull & Bear",
            url: "https://bullandbear.pro",
            logo: "https://bullandbear.pro/BB_logo.png",
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
            url: "https://bullandbear.pro",
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
            url: "https://bullandbear.pro",
            description:
              "A trading journal and analytics platform for day traders and forex traders. Track trades, review statistics, and keep a daily trading journal. Supports cTrader and MetaTrader imports.",
            screenshot: "https://bullandbear.pro/dashboard_example.png",
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                name: "Free Trial",
                description: "14-day free trial with access to all features",
              },
              {
                "@type": "Offer",
                price: "9.99",
                priceCurrency: "USD",
                name: "Monthly Plan",
                billingIncrement: "P1M",
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "120",
            },
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <TutorialContextProvider>
            {children}
          </TutorialContextProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
