"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { listCourses } from "@/lib/courses";
import { getAssignedCourseIds } from "@/lib/assignments";
import { getCourseProgress } from "@/lib/progress";
import type { Course } from "@/lib/types";

type CourseWithProgress = {
  course: Course;
  progress: number;
};

function statusMeta(progress: number) {
  if (progress >= 100) {
    return {
      label: "Terminée",
      className: "bg-green-100 text-green-800",
      Icon: CheckCircle2,
      cta: "Revoir",
    };
  }
  if (progress > 0) {
    return {
      label: "En cours",
      className: "bg-brand-100 text-brand-700",
      Icon: PlayCircle,
      cta: "Continuer",
    };
  }
  return {
    label: "À commencer",
    className: "bg-amber-100 text-amber-800",
    Icon: BookOpen,
    cta: "Commencer",
  };
}

function coverSrc(course: Course) {
  return course.image || course.mediaUrl || "";
}

export default function StudentDashboardPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName =
    profile?.firstName?.trim() ||
    user?.email?.split("@")[0] ||
    "étudiant";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user?.uid) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [assignedIds, allCourses] = await Promise.all([
          getAssignedCourseIds(user.uid),
          listCourses({ publishedOnly: true, fallbackStatic: false }),
        ]);
        const allowed = new Set(assignedIds);
        const mine = allCourses.filter((c) => allowed.has(c.id));

        const withProgress = await Promise.all(
          mine.map(async (course) => {
            const prog = await getCourseProgress(user.uid, course.id);
            return {
              course,
              progress: prog?.percent ?? 0,
            };
          })
        );

        if (!cancelled) setItems(withProgress);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const avgProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, i) => acc + i.progress, 0);
    return Math.round(sum / items.length);
  }, [items]);

  const completedCount = useMemo(
    () => items.filter((i) => i.progress >= 100).length,
    [items]
  );

  const ongoingCount = useMemo(
    () => items.filter((i) => i.progress > 0 && i.progress < 100).length,
    [items]
  );

  const stats = [
    {
      icon: BookOpen,
      value: String(items.length),
      label: "Formations affectées",
      hint: ongoingCount > 0 ? `${ongoingCount} en cours` : "Catalogue personnel",
    },
    {
      icon: TrendingUp,
      value: `${avgProgress}%`,
      label: "Progression moyenne",
      hint: items.length ? "Sur vos parcours" : "Aucune donnée",
    },
    {
      icon: Award,
      value: String(completedCount),
      label: "Formations terminées",
      hint: completedCount ? "Bravo !" : "À compléter",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero welcome */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-950 px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-700/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
            Espace étudiant
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            Bonjour {firstName}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Suivez vos formations affectées et reprenez là où vous vous êtes
            arrêté.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, label, hint }) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-100/80 bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-2xl font-extrabold text-brand-950">{value}</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-950">{label}</p>
            <p className="mt-0.5 text-xs text-brand-950/45">{hint}</p>
          </div>
        ))}
      </div>

      {/* Formations */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-950">Mes formations</h2>
          <Button href="/dashboard/formations" variant="ghost" className="!px-3 !py-1.5 text-xs">
            Voir tout
          </Button>
        </div>

        {loading ? (
          <p className="rounded-2xl bg-white py-12 text-center text-sm text-brand-950/50 shadow-soft">
            Chargement…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-100 bg-white px-6 py-14 text-center shadow-soft">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-brand-950">
              Aucune formation affectée
            </p>
            <p className="mt-1 text-sm text-brand-950/50">
              Dès qu&apos;une formation vous sera assignée, elle apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 6).map(({ course, progress }) => {
              const src = coverSrc(course);
              const isRemote = src.startsWith("http");
              const isFirebase = src.includes("firebasestorage");
              const meta = statusMeta(progress);
              const StatusIcon = meta.Icon;

              return (
                <article
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-brand-100/80 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="relative h-36 bg-brand-100">
                    {src ? (
                      isRemote ? (
                        <Image
                          src={src}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          unoptimized={isFirebase}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-700/40">
                        <BookOpen className="h-9 w-9" />
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    {course.category && (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
                        {course.category}
                      </p>
                    )}
                    <h3 className="text-base font-bold leading-snug text-brand-950">
                      {course.title}
                    </h3>
                    {course.duration && (
                      <p className="inline-flex items-center gap-1 text-xs text-brand-700/70">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </p>
                    )}
                    <ProgressBar value={progress} showLabel className="mt-1" />
                    <Button
                      href={`/formations/${course.slug}`}
                      variant="primary"
                      className="mt-auto w-full"
                    >
                      {meta.cta}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
