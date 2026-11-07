"use client";

import Image from "next/image";
import {
  Award,
  BookOpen,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Users,
  Building2,
  Smile,
} from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { BrandBadge } from "@/components/Logo";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    { icon: Award, label: t.home.featCert },
    { icon: GraduationCap, label: t.home.featExperts },
    { icon: BookOpen, label: t.home.featTheory },
    { icon: ShieldCheck, label: t.home.featSafety },
  ];

  const stats = [
    { icon: Users, value: "+ 500", label: t.home.statStudents },
    { icon: BookOpen, value: "+ 20", label: t.home.statFormations },
    { icon: Building2, value: "+ 5", label: t.home.statYears },
    { icon: Smile, value: "100%", label: t.home.statSatisfaction },
  ];

  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-950/40" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <BrandBadge className="mb-6" />
            <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t.home.heroTitleBefore}{" "}
              <span className="text-brand-500">{t.home.heroTitleAccent}</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/formations" variant="primary" className="px-6 py-3">
                {t.home.ctaFormations}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-w-0 items-center gap-3 rounded-[14px] bg-white px-4 py-4 shadow-card sm:px-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 break-words text-sm font-semibold text-brand-950">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid overflow-hidden rounded-[14px] md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 bg-brand-700 p-6 text-white sm:p-10">
            <Laptop className="h-10 w-10 text-brand-100" />
            <h3 className="text-lg font-bold sm:text-xl">{t.home.onlineTitle}</h3>
            <p className="text-sm text-white/80">{t.home.onlineText}</p>
          </div>
          <div className="relative min-h-[200px] sm:min-h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-950/90 to-transparent p-6 sm:p-10">
              <h3 className="text-lg font-bold text-white sm:text-xl">
                {t.home.presentielTitle}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                {t.home.presentielText}
              </p>
              <Button href="/formations" variant="primary" className="mt-4 w-fit">
                {t.home.reserve}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-100 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-brand-950 sm:text-xl">
                  {value}
                </p>
                <p className="break-words text-sm text-brand-950/60">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
