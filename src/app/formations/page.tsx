"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { CourseCard } from "@/components/CourseCard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { listCourses } from "@/lib/courses";
import { getAssignedCourseIds } from "@/lib/assignments";
import type { Course } from "@/lib/types";

export default function FormationsPage() {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        // Admin : toutes les formations. Client : uniquement celles affectées (+ publiées)
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
        const filtered = allPublished.filter((c) => allowed.has(c.id));
        if (!cancelled) setCourses(filtered);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Impossible de charger les formations."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, isAdmin]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) {
      if (c.category?.trim()) set.add(c.category.trim());
    }
    return ["Toutes", ...Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((f) => {
      const matchCat = category === "Toutes" || f.category === category;
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [courses, query, category]);

  return (
    <PublicShell>
      <RequireAuth>
        <section className="bg-brand-950 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-extrabold text-white">Nos Formations</h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              {isAdmin
                ? "Vue admin : toutes les formations."
                : "Formations qui vous ont été affectées."}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/50" />
              <input
                type="search"
                placeholder="Rechercher une formation…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-brand-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-brand-500 focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    category === cat
                      ? "bg-brand-700 text-white"
                      : "bg-brand-100 text-brand-700 hover:bg-brand-500/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-brand-950/50">
              Chargement des formations…
            </p>
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-100 bg-brand-50/50 py-16 text-center text-sm text-brand-950/55">
              {courses.length === 0
                ? isAdmin
                  ? "Aucune formation. Ajoutez-en depuis l'admin."
                  : "Aucune formation ne vous a été affectée pour le moment."
                : "Aucune formation ne correspond à votre recherche."}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((f) => (
                <CourseCard key={f.id} formation={f} showPrice />
              ))}
            </div>
          )}
        </section>
      </RequireAuth>
    </PublicShell>
  );
}
