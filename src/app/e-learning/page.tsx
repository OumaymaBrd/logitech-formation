"use client";

import { useEffect, useState } from "react";
import { Laptop, PlayCircle } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/CourseCard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { listCourses } from "@/lib/courses";
import { getAssignedCourseIds } from "@/lib/assignments";
import type { Course } from "@/lib/types";

export default function ELearningPage() {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        if (isAdmin) {
          const list = await listCourses({
            publishedOnly: false,
            fallbackStatic: false,
          });
          if (!cancelled) setCourses(list);
          return;
        }

        if (!user?.uid) {
          if (!cancelled) setCourses([]);
          return;
        }

        const [allPublished, assignedIds] = await Promise.all([
          listCourses({ publishedOnly: true, fallbackStatic: false }),
          getAssignedCourseIds(user.uid),
        ]);
        const allowed = new Set(assignedIds);
        if (!cancelled) {
          setCourses(allPublished.filter((c) => allowed.has(c.id)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, isAdmin]);

  return (
    <PublicShell>
      <RequireAuth>
        <section className="bg-brand-950 px-4 py-14 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white">
                <Laptop className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                Espace e-learning
              </h1>
              <p className="mt-3 text-sm text-white/70">
                {isAdmin
                  ? "Vue admin : toutes les formations."
                  : "Formations qui vous ont été affectées."}
              </p>
            </div>
            <Button href="/dashboard" variant="primary" className="w-fit gap-2">
              <PlayCircle className="h-4 w-4" /> Accéder à mon espace
            </Button>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="mb-6 text-xl font-bold text-brand-950">
            Formations disponibles en ligne
          </h2>
          {loading ? (
            <p className="py-12 text-center text-sm text-brand-950/50">
              Chargement…
            </p>
          ) : courses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-100 bg-brand-50/50 py-16 text-center text-sm text-brand-950/55">
              {isAdmin
                ? "Aucune formation. Ajoutez-en depuis l'admin."
                : "Aucune formation ne vous a été affectée pour le moment."}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((f) => (
                <CourseCard key={f.id} formation={f} showPrice />
              ))}
            </div>
          )}
        </section>
      </RequireAuth>
    </PublicShell>
  );
}
