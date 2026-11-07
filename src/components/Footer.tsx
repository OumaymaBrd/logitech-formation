"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/i18n/LanguageProvider";

const MAPS_URL =
  "https://www.google.com/maps/place/Opal+Dental+Center+-+Dr.EL+IDRISSI+NIHAD/@35.754921,-5.8280544,17z/data=!4m6!3m5!1s0xd0b870024fc6247:0x755124c5632764d3!8m2!3d35.7549286!4d-5.8280503!16s%2Fg%2F11m6vl3bn_?hl=fr";

const INSTAGRAM_URL = "https://www.instagram.com/logitech_formation/";
const FACEBOOK_URL = "https://www.facebook.com/share/1FQHcF2kce/";
const TIKTOK_URL = "https://www.tiktok.com/@logitechformation";

const socials = [
  {
    label: "Facebook",
    href: FACEBOOK_URL,
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01",
    rect: true,
  },
  {
    label: "TikTok",
    href: TIKTOK_URL,
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
          <div className="mb-4">
            <Logo variant="footer" />
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
              <span className="min-w-0 break-words">+212 5XX-XXXXXX</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span className="min-w-0 break-all">
                contact@logitech-formation.ma
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 break-words hover:text-white hover:underline"
              >
                {t.footer.location}
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
