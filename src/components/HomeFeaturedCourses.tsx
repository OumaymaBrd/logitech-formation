"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/Button";
import { listCourses } from "@/lib/courses";
import type { Course } from "@/lib/types";

export function HomeFeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses({ publishedOnly: true, fallbackStatic: false })
      .then((list) => setCourses(list.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-950 sm:text-3xl">
            Nos principales formations
          </h2>
          <p className="mt-2 text-sm text-brand-950/60">
            Des parcours certifiants adaptés aux besoins du terrain.
          </p>
        </div>
        <Button href="/formations" variant="ghost">
          Voir tout
        </Button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-brand-950/50">Chargement…</p>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-100 bg-brand-50/50 py-14 text-center text-sm text-brand-950/55">
          Aucune formation publiée pour le moment.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((f) => (
            <CourseCard key={f.id} formation={f} />
          ))}
        </div>
      )}
    </section>
  );
}
