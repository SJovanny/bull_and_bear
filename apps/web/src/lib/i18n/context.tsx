"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import type { Locale, TranslationKeys } from "./types";
import { fr } from "./translations/fr";
import { en } from "./translations/en";

const dictionaries: Record<Locale, TranslationKeys> = { fr, en };

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationKeys) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
});

// getInitialLocale will now only be called inside useEffect on the client
function getInitialLocaleFromStorage(): Locale | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("bb_lang");
  if (saved === "en" || saved === "fr") return saved;
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always initialize with 'fr' to match server rendering. This prevents hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLocale = getInitialLocaleFromStorage();
    if (savedLocale && savedLocale !== "fr") {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("bb_lang", next);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const t = useCallback(
    (key: keyof TranslationKeys): string => {
      return dictionaries[locale][key] ?? key;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
