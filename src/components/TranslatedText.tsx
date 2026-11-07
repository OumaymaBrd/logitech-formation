"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  text: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  /** Si false, n'affiche que le texte source (pas de fetch) */
  enabled?: boolean;
};

/**
 * Affiche un texte saisi en français.
 * En locale AR, le traduit automatiquement via Google Translate (API interne).
 */
export function TranslatedText({
  text,
  as: Tag = "span",
  className,
  enabled = true,
}: Props) {
  const { locale } = useI18n();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let cancelled = false;
    setDisplay(text);

    if (!enabled || locale !== "ar" || !text.trim()) {
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from: "fr", to: "ar" }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { translation?: string };
        if (!cancelled && data.translation) {
          setDisplay(data.translation);
        }
      } catch {
        /* garde le français si échec */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, locale, enabled]);

  return <Tag className={className}>{display}</Tag>;
}

/** Hook pour traduire une chaîne (ex. titres de cours dynamiques). */
export function useTranslated(text: string): string {
  const { locale } = useI18n();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let cancelled = false;
    setDisplay(text);
    if (locale !== "ar" || !text.trim()) return;

    (async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from: "fr", to: "ar" }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { translation?: string };
        if (!cancelled && data.translation) setDisplay(data.translation);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, locale]);

  return display;
}
