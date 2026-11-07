"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlayCircle,
  Search,
  Wrench,
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

type FilterKey = "all" | "ongoing" | "done" | "todo";

const PAGE_SIZE = 5;

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

export default function MesFormationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

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
            return { course, progress: prog?.percent ?? 0 };
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

  const counts = useMemo(() => {
    let done = 0;
    let ongoing = 0;
    let todo = 0;
    for (const i of items) {
      if (i.progress >= 100) done += 1;
      else if (i.progress > 0) ongoing += 1;
      else todo += 1;
    }
    return { total: items.length, done, ongoing, todo };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ course, progress }) => {
      if (filter === "done" && progress < 100) return false;
      if (filter === "ongoing" && !(progress > 0 && progress < 100)) return false;
      if (filter === "todo" && progress !== 0) return false;
      if (!q) return true;
      const hay = `${course.title} ${course.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, filter]);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const rangeLabel = useMemo(() => {
    if (filtered.length === 0) return "0 formation";
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
    return `${start}–${end} sur ${filtered.length}`;
  }, [filtered.length, currentPage]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Toutes", count: counts.total },
    { key: "todo", label: "À commencer", count: counts.todo },
    { key: "ongoing", label: "En cours", count: counts.ongoing },
    { key: "done", label: "Terminées", count: counts.done },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-brand-100/80 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950">
              Mes formations
            </h1>
            <p className="mt-1 text-sm text-brand-950/55">
              Formations qui vous ont été affectées par l&apos;administrateur.
            </p>
          </div>
          {items.length > 0 && (
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par titre ou catégorie…"
                className="w-full rounded-xl border border-brand-100 bg-brand-50/50 py-2.5 pl-10 pr-3 text-sm outline-none ring-brand-500 focus:bg-white focus:ring-2"
              />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  filter === f.key
                    ? "bg-brand-700 text-white"
                    : "bg-brand-100 text-brand-700 hover:bg-brand-500/20"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    filter === f.key ? "bg-white/20" : "bg-white text-brand-700"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-brand-950/50">
          Chargement…
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-100 bg-white px-6 py-16 text-center shadow-soft">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-brand-950">
            Aucune formation affectée
          </p>
          <p className="mt-1 text-sm text-brand-950/50">
            L&apos;administrateur doit vous affecter une formation pour y
            accéder.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-100 bg-white py-12 text-center text-sm text-brand-950/55">
          Aucune formation dans ce filtre.
        </p>
      ) : (
        <>
        <ul className="space-y-4">
          {pageItems.map(({ course, progress }) => {
            const src = coverSrc(course);
            const isRemote = src.startsWith("http");
            const isFirebase = src.includes("firebasestorage");
            const meta = statusMeta(progress);
            const StatusIcon = meta.Icon;

            return (
              <li key={course.id}>
                <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-100/80 bg-white shadow-soft transition hover:shadow-card sm:flex-row">
                  <div className="relative h-44 w-full shrink-0 bg-brand-100 sm:h-auto sm:w-52 md:w-60">
                    {src ? (
                      isRemote ? (
                        <Image
                          src={src}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="240px"
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
                      <div className="flex h-full min-h-[11rem] items-center justify-center text-brand-700/40">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        {course.category && (
                          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
                            {course.category}
                          </p>
                        )}
                        <h2 className="mt-0.5 text-lg font-bold text-brand-950">
                          {course.title}
                        </h2>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-brand-700/80">
                      {course.duration && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </span>
                      )}
                      {course.theory && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          Théorie
                        </span>
                      )}
                      {course.practice && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1">
                          <Wrench className="h-3.5 w-3.5" />
                          Pratique
                        </span>
                      )}
                    </div>

                    <ProgressBar value={progress} showLabel />

                    <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-1">
                      <Button
                        href={`/formations/${course.slug}`}
                        variant="primary"
                        className="w-full min-w-0 sm:w-auto sm:min-w-[140px]"
                      >
                        {meta.cta}
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs font-medium text-brand-950/55">
            {rangeLabel}
            <span className="text-brand-950/35"> · </span>
            {PAGE_SIZE} par page
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Préc.
            </button>
            <span className="min-w-[4.5rem] text-center text-xs font-bold text-brand-950">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suiv.
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
