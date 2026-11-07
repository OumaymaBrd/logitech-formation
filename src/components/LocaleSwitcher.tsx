"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n/types";

type Props = {
  className?: string;
  /** default = clair ; dark = sidebar violet */
  variant?: "default" | "light" | "dark";
};

export function LocaleSwitcher({ className = "", variant = "default" }: Props) {
  const { locale, setLocale, t } = useI18n();
  const options: { code: Locale; label: string }[] = [
    { code: "fr", label: t.lang.fr },
    { code: "ar", label: t.lang.ar },
  ];

  const border =
    variant === "dark" ? "border-white/25" : "border-brand-100";
  const inactive =
    variant === "dark"
      ? "bg-white/10 text-white hover:bg-white/20"
      : "bg-white text-brand-700 hover:bg-brand-50";
  const active =
    variant === "dark" ? "bg-brand-500 text-white" : "bg-brand-700 text-white";

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-lg border ${border} ${className}`}
      role="group"
      aria-label="Language"
    >
      {options.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2 py-1 text-[11px] font-semibold transition sm:px-2.5 sm:py-1.5 sm:text-xs ${
            locale === code ? active : inactive
          }`}
          aria-pressed={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
