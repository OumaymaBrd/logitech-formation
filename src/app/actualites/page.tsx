"use client";

import Image from "next/image";
import { CalendarDays, Newspaper } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/LanguageProvider";

const images = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80",
];

export default function ActualitesPage() {
  const { t } = useI18n();
  const news = t.news.items.map((item, i) => ({
    ...item,
    image: images[i] || images[0],
  }));
  const [featured, ...others] = news;

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Newspaper className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                {t.news.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                {t.news.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-12 sm:px-6">
        <article className="grid overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft md:grid-cols-2">
          <div className="relative min-h-[220px] sm:min-h-[280px]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                <CalendarDays className="h-3.5 w-3.5" />
                {featured.date}
              </span>
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                {featured.tag}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold leading-snug text-brand-950">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-950/65 sm:text-base">
              {featured.excerpt}
            </p>
          </div>
        </article>

        <div className="grid gap-5 sm:grid-cols-2">
          {others.map((n) => (
            <article
              key={n.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="relative h-44 w-full bg-brand-100">
                <Image
                  src={n.image}
                  alt={n.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {n.date}
                  </span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                    {n.tag}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-brand-950">
                  {n.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-950/65">
                  {n.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-brand-950">{t.news.ctaTitle}</p>
            <p className="mt-1 text-xs text-brand-950/60">{t.news.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/inscription" variant="primary">
              {t.news.ctaSignup}
            </Button>
            <Button href="/contact" variant="ghost">
              {t.news.ctaContact}
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
