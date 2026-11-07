"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMessages, type Messages } from "./index";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./types";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<Ctx | null>(null);

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (saved === "fr" || saved === "ar") {
        setLocaleState(saved);
        applyDocumentLocale(saved);
      } else {
        applyDocumentLocale(DEFAULT_LOCALE);
      }
    } catch {
      applyDocumentLocale(DEFAULT_LOCALE);
    }
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    applyDocumentLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: getMessages(locale),
      dir: locale === "ar" ? "rtl" : "ltr",
    }),
    [locale, setLocale]
  );

  // Avoid flashing wrong language before hydration of saved locale
  if (!ready) {
    return (
      <LanguageContext.Provider
        value={{
          locale: DEFAULT_LOCALE,
          setLocale,
          t: getMessages(DEFAULT_LOCALE),
          dir: "ltr",
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}
