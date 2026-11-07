"use client";

import Image from "next/image";
import {
  Award,
  BookOpen,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/LanguageProvider";

const MAPS_URL =
  "https://www.google.com/maps/place/Opal+Dental+Center+-+Dr.EL+IDRISSI+NIHAD/@35.754921,-5.8280544,17z/data=!4m6!3m5!1s0xd0b870024fc6247:0x755124c5632764d3!8m2!3d35.7549286!4d-5.8280503!16s%2Fg%2F11m6vl3bn_?hl=fr";

export default function AProposPage() {
  const { t } = useI18n();

  const values = [
    { icon: Award, title: t.about.v1Title, text: t.about.v1Text },
    { icon: BookOpen, title: t.about.v2Title, text: t.about.v2Text },
    { icon: ShieldCheck, title: t.about.v3Title, text: t.about.v3Text },
    { icon: Users, title: t.about.v4Title, text: t.about.v4Text },
  ];

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">{t.about.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft lg:grid-cols-2">
          <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/20 to-transparent" />
            <div className="absolute bottom-0 inset-inline-start-0 inset-inline-end-0 p-5 sm:p-6">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm transition hover:bg-white hover:text-brand-800"
              >
                <MapPin className="h-3.5 w-3.5" />
                {t.about.location}
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <Logo
              variant="header"
              href={null}
              className="h-10 w-auto self-start sm:h-11"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                {t.about.badge}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-950">
                {t.about.whoTitle}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-brand-950/75">
              {t.about.p1}
            </p>
            <p className="text-sm leading-relaxed text-brand-950/75">
              {t.about.p2}
            </p>
            <p className="text-sm leading-relaxed text-brand-950/75">
              {t.about.p3}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button href="/formations" variant="primary">
                {t.about.seeFormations}
              </Button>
              <Button href="/contact" variant="ghost">
                {t.about.contactUs}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-brand-950">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-950/60">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
