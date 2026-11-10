"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/i18n/LanguageProvider";
import { SITE } from "@/lib/site";

const socials = [
  {
    label: "Facebook",
    href: SITE.social.facebook,
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Instagram",
    href: SITE.social.instagram,
    path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01",
    rect: true,
  },
  {
    label: "TikTok",
    href: SITE.social.tiktok,
    path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5",
  },
];

export function Footer() {
  const { t } = useI18n();

  const links = [
    ["/", t.nav.home],
    ["/formations", t.nav.formations],
    ["/a-propos", t.nav.about],
    ["/contact", t.nav.contact],
    ["/connexion", t.nav.login],
  ] as const;

  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 inline-flex rounded-xl bg-white px-3 py-2 shadow-soft">
            <Logo variant="header" className="!h-10 !max-h-10 !max-w-[11rem]" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            {t.footer.blurb}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-500">
            {t.footer.usefulLinks}
          </h4>
          <ul className="space-y-2 text-sm text-white/80">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-500">
            {t.footer.contact}
          </h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a
                href={`tel:${SITE.phoneE164}`}
                className="min-w-0 break-words hover:text-white hover:underline"
              >
                {SITE.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a
                href={`mailto:${SITE.email}`}
                className="min-w-0 break-all hover:text-white hover:underline"
              >
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 break-words hover:text-white hover:underline"
              >
                {SITE.addressLabel}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  s.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-brand-700"
                aria-label={s.label}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {s.rect && (
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  )}
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        {t.footer.rights}
      </div>
    </footer>
  );
}
