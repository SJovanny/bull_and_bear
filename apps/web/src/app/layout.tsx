import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { TutorialContextProvider } from "@/components/tutorial/tutorial-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bullandbear.com"),
  title: {
    default: "Bull & Bear — Trading Journal & Analytics",
    template: "%s — Bull & Bear",
  },
  description:
    "Track, analyze, and improve your trading performance. Import trades from cTrader, view detailed statistics, and keep a daily trading journal.",
  keywords: [
    "trading journal",
    "journal de trading",
    "trading analytics",
    "cTrader import",
    "trading performance",
    "trade tracker",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: "https://bullandbear.com",
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
    // Default lang="fr" — reflects the primary audience. The i18n provider
    // handles runtime translation; a per-user lang attribute would require
    // middleware or a client-side effect (future improvement).
    <html lang="fr" suppressHydrationWarning>
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
