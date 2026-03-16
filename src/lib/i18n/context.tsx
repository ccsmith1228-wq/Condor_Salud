"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import translations, { type Locale } from "./translations";

// ─── Context ─────────────────────────────────────────────────

interface LanguageCtx {
  locale: Locale;
  isEn: boolean;
  toggleLocale: () => void;
  /** Look up a key from the translations dictionary */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageCtx>({
  locale: "es",
  isEn: false,
  toggleLocale: () => {},
  t: (key) => key,
});

// ─── Provider ────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "es" ? "en" : "es"));
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale];
    },
    [locale],
  );

  const value = useMemo<LanguageCtx>(
    () => ({ locale, isEn: locale === "en", toggleLocale, t }),
    [locale, toggleLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────

export function useLocale() {
  return useContext(LanguageContext);
}
