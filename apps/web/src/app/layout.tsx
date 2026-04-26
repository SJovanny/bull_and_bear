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
  title: "Bull & Bear",
  description: "Trading Journal & Analytics",
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
    {/* Default lang="fr" — reflects the primary audience. The i18n provider
        handles runtime translation; a per-user lang attribute would require
        middleware or a client-side effect (future improvement). */}
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
