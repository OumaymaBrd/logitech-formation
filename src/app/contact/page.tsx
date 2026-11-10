"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { ContactForm } from "@/components/ContactForm";
import { useI18n } from "@/i18n/LanguageProvider";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">
            {t.contact.title}
          </h1>
          <p className="mt-2 text-sm text-white/70">{t.contact.subtitle}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[14px] bg-white p-5 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-brand-700">
                {t.contact.phone}
              </p>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="text-sm font-medium text-brand-950 hover:text-brand-700 hover:underline"
              >
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] bg-white p-5 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-brand-700">
                {t.contact.email}
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="break-all text-sm font-medium text-brand-950 hover:text-brand-700 hover:underline"
              >
                {SITE.email}
              </a>
            </div>
          </div>

          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-[14px] bg-white p-5 shadow-card transition hover:bg-brand-50 hover:shadow-lg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-700">
                {t.contact.location}
              </p>
              <p className="text-sm font-medium text-brand-950">
                {t.contact.locationValue}
              </p>
            </div>
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              {t.contact.maps}
            </span>
          </a>

          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-[14px] bg-white p-5 shadow-card transition hover:shadow-lg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-brand-700">
                {t.contact.instagram}
              </p>
              <p className="text-sm font-medium text-brand-950">
                @logitech_formation
              </p>
            </div>
          </a>
        </div>
        <ContactForm />
      </section>
    </PublicShell>
  );
}
