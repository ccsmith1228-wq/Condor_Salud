"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import translations, { type Locale } from "./translations";
import {
  type Segment,
  getSegmentFromCookie,
  setSegmentCookie,
  detectSegmentFromEmail,
  SEGMENT_LABELS,
} from "@/lib/segments";

// ─── Context ─────────────────────────────────────────────────

interface LanguageCtx {
  locale: Locale;
  isEn: boolean;
  toggleLocale: () => void;
  /** Current visitor segment */
  segment: Segment;
  /** Manually change the segment */
  setSegment: (s: Segment) => void;
  /** Detect + set segment from an email address */
  detectFromEmail: (email: string) => Segment;
  /** Segment display label in current locale */
  segmentLabel: string;
  /** Look up a key — returns segment-specific variant if available */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageCtx>({
  locale: "es",
  isEn: false,
  toggleLocale: () => {},
  segment: "default",
  setSegment: () => {},
  detectFromEmail: () => "default",
  segmentLabel: "",
  t: (key) => key,
});

// ─── Provider ────────────────────────────────────────────────

const LOCALE_COOKIE = "condor_locale";
const LOCALE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "es";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const val = match?.[1];
  return val === "en" ? "en" : "es";
}

function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Read locale from cookie synchronously on first client render
  // to avoid the flash from "es" → "en" after mount
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof document === "undefined") return "es";
    return getLocaleFromCookie();
  });
  const [segment, _setSegment] = useState<Segment>(() => {
    if (typeof document === "undefined") return "default";
    return getSegmentFromCookie();
  });

  // Keep html lang attribute and cookie in sync
  useEffect(() => {
    document.documentElement.lang = locale;
    setLocaleCookie(locale);
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "es" ? "en" : "es"));
  }, []);

  const setSegment = useCallback((s: Segment) => {
    _setSegment(s);
    setSegmentCookie(s);
  }, []);

  const detectFromEmail = useCallback(
    (email: string): Segment => {
      const detected = detectSegmentFromEmail(email);
      setSegment(detected);
      return detected;
    },
    [setSegment],
  );

  /**
   * Look up a translation key.
   *
   * Resolution order:
   * 1. "{key}@{segment}"  — segment-specific override
   * 2. "{key}"            — default translation
   * 3. raw key string     — fallback
   *
   * This lets us add targeted overrides like "hero.title1@tourist"
   * without touching existing translations.
   */
  const t = useCallback(
    (key: string): string => {
      // Try segment-specific key first
      if (segment !== "default") {
        const segKey = `${key}@${segment}`;
        const segEntry = translations[segKey];
        if (segEntry) return segEntry[locale];
      }
      // Fall back to default key
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale];
    },
    [locale, segment],
  );

  const segmentLabel = useMemo(() => SEGMENT_LABELS[segment][locale], [segment, locale]);

  const value = useMemo<LanguageCtx>(
    () => ({
      locale,
      isEn: locale === "en",
      toggleLocale,
      segment,
      setSegment,
      detectFromEmail,
      segmentLabel,
      t,
    }),
    [locale, toggleLocale, segment, setSegment, detectFromEmail, segmentLabel, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────

export function useLocale() {
  return useContext(LanguageContext);
}
