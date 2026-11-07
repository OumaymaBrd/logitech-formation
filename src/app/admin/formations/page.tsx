"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { listCourses, setCoursePublished } from "@/lib/courses";
import type { Course } from "@/lib/types";
import { useI18n } from "@/i18n/LanguageProvider";

const PAGE_SIZE = 10;

export default function AdminFormationsPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);

  async function reload() {
    const list = await listCourses({
      publishedOnly: false,
      fallbackStatic: false,
    });
    setCourses(list);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return courses.slice(start, start + PAGE_SIZE);
  }, [courses, page]);

  async function togglePublish(c: Course) {
    setError("");
    setSuccess("");
    setBusyId(c.id);
    try {
      const next = !c.published;
      await setCoursePublished(c.id, next);
      setCourses((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, published: next } : x))
      );
      setSuccess(
        next
          ? `« ${c.title} » est maintenant visible dans l'espace client.`
          : `« ${c.title} » est repassé en brouillon (masqué côté client).`
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de changer le statut."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-950">
            {t.admin.formations}
          </h1>
          <p className="mt-1 text-sm text-brand-950/60">
            {courses.length} {t.admin.formationsSubtitle}
          </p>
        </div>
        <Button href="/admin/ajout-cours" variant="primary" className="gap-2">
          <Plus className="h-4 w-4" /> {t.admin.addCourse}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-brand-950/50">Chargement…</p>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-100 bg-white py-12 text-center text-sm text-brand-950/55">
          Aucun cours pour le moment.{" "}
          <Link
            href="/admin/ajout-cours"
            className="font-semibold text-brand-700"
          >
            Ajouter un cours
          </Link>
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {pageItems.map((c) => {
              const img = c.image || "";
              const isFirebase = img.includes("firebasestorage");
              return (
                <article
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft"
                >
                  <div className="relative h-36 w-full bg-brand-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={c.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized={isFirebase}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-brand-700/60">
                        Pas d&apos;image
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${
                        c.published
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {c.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h2 className="line-clamp-2 text-base font-bold text-brand-950">
                        {c.title}
                      </h2>
                      <p className="mt-1 text-xs text-brand-950/50">
                        {c.category} · {c.mediaType}
                        {c.duration ? ` · ${c.duration}` : ""}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => togglePublish(c)}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition disabled:opacity-50 sm:flex-none ${
                          c.published
                            ? "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
                            : "bg-brand-700 text-white hover:bg-brand-800"
                        }`}
                      >
                        {busyId === c.id ? (
                          "…"
                        ) : c.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Publier
                          </>
                        )}
                      </button>
                      <Link
                        href={`/formations/${c.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-100 px-3 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 sm:flex-none"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination 10 / page */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3">
            <p className="text-xs text-brand-950/55">
              Page {page} / {totalPages} · {courses.length} formation
              {courses.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
