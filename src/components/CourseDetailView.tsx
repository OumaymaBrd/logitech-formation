"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Check } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CourseMedia, formatVideoDuration } from "@/components/CourseMedia";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCourseBySlug, saveCourseVideoDuration } from "@/lib/courses";
import { getAssignedCourseIds } from "@/lib/assignments";
import { getCourseProgress, saveCourseProgress } from "@/lib/progress";
import type { Course } from "@/lib/types";

export function CourseDetailView({ slug }: { slug: string }) {
  const { user, isAdmin } = useAuth();
  const [formation, setFormation] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVideoDurationSec(null);
    setCompletedIds([]);
    setActiveModuleId(null);
    setForbidden(false);

    (async () => {
      try {
        const c = await getCourseBySlug(slug, {
          publishedOnly: !isAdmin,
        });
        if (cancelled) return;
        if (!c) {
          setNotFound(true);
          return;
        }

        // Client : uniquement les formations affectées
        if (!isAdmin && user?.uid) {
          const assigned = await getAssignedCourseIds(user.uid);
          if (cancelled) return;
          if (!assigned.includes(c.id)) {
            setForbidden(true);
            return;
          }
        }

        setFormation(c);
        if (typeof c.videoDurationSec === "number") {
          setVideoDurationSec(c.videoDurationSec);
        }

        const mods =
          c.modules?.length > 0
            ? c.modules
            : [{ id: "m1", title: "Leçon principale", duration: "" }];
        setActiveModuleId(mods[0]?.id ?? "m1");

        if (user?.uid) {
          const prog = await getCourseProgress(user.uid, c.id);
          if (cancelled) return;
          if (prog) {
            setCompletedIds(prog.completedModuleIds);
            if (
              prog.videoDurationSec != null &&
              typeof c.videoDurationSec !== "number"
            ) {
              setVideoDurationSec(prog.videoDurationSec);
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, user?.uid, isAdmin]);

  const modules = useMemo(() => {
    if (!formation) return [];
    if (formation.modules?.length) return formation.modules;
    return [
      {
        id: "m1",
        title: "Leçon principale",
        duration: "",
        completed: false,
      },
    ];
  }, [formation]);

  const progress =
    modules.length > 0
      ? Math.round((completedIds.length / modules.length) * 100)
      : 0;

  const activeModule =
    modules.find((m) => m.id === activeModuleId) ?? modules[0];

  const lessonText =
    formation?.content ||
    formation?.description ||
    "Aucun contenu textuel pour cette leçon.";

  const hasVideo =
    formation?.mediaType === "video" || formation?.mediaType === "both";
  const isTextOnly = formation?.mediaType === "none";

  const displayDuration = (() => {
    if (isTextOnly) return null;
    if (hasVideo) {
      if (videoDurationSec != null && videoDurationSec > 0) {
        return formatVideoDuration(videoDurationSec);
      }
      return null; // pas de placeholder "…" / "5 s" fantôme
    }
    const courseDur = formation?.duration?.trim();
    return courseDur || null;
  })();

  const persistProgress = useCallback(
    async (
      nextCompleted: string[],
      videoSec?: number | null
    ) => {
      if (!user?.uid || !formation) return;
      setSaving(true);
      setSaveMsg("");
      try {
        await saveCourseProgress({
          userId: user.uid,
          courseId: formation.id,
          courseSlug: formation.slug,
          completedModuleIds: nextCompleted,
          moduleCount: modules.length,
          videoDurationSec: videoSec ?? videoDurationSec,
        });
        setSaveMsg("Progression enregistrée");
      } catch (e) {
        setSaveMsg(
          e instanceof Error ? e.message : "Erreur de sauvegarde"
        );
      } finally {
        setSaving(false);
      }
    },
    [user?.uid, formation, modules.length, videoDurationSec]
  );

  async function onVideoDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setVideoDurationSec(seconds);

    // Sauvegarder durée vidéo sur le cours (partagée) si absente
    if (formation && typeof formation.videoDurationSec !== "number") {
      try {
        await saveCourseVideoDuration(formation.id, seconds);
        setFormation((prev) =>
          prev ? { ...prev, videoDurationSec: Math.round(seconds) } : prev
        );
      } catch {
        /* ignore */
      }
    }

    // Et sur la progression utilisateur
    if (user?.uid && formation) {
      try {
        await saveCourseProgress({
          userId: user.uid,
          courseId: formation.id,
          courseSlug: formation.slug,
          completedModuleIds: completedIds,
          moduleCount: modules.length,
          videoDurationSec: seconds,
        });
      } catch {
        /* ignore */
      }
    }
  }

  async function toggleModuleComplete(moduleId: string) {
    const next = completedIds.includes(moduleId)
      ? completedIds.filter((id) => id !== moduleId)
      : [...completedIds, moduleId];
    setCompletedIds(next);
    await persistProgress(next);
  }

  return (
    <PublicShell>
      <RequireAuth>
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-brand-950/50">
            Chargement du cours…
          </div>
        ) : forbidden ? (
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h1 className="text-xl font-bold text-brand-950">
              Formation non accessible
            </h1>
            <p className="mt-2 text-sm text-brand-950/60">
              Cette formation ne vous a pas été affectée.
            </p>
            <Link
              href="/formations"
              className="mt-4 inline-block text-brand-700"
            >
              ← Retour aux formations
            </Link>
          </div>
        ) : notFound || !formation ? (
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h1 className="text-xl font-bold text-brand-950">
              Cours introuvable
            </h1>
            <Link
              href="/formations"
              className="mt-4 inline-block text-brand-700"
            >
              ← Retour aux formations
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <nav className="mb-6 text-sm text-brand-950/50">
              <Link href="/" className="hover:text-brand-700">
                Accueil
              </Link>
              <span className="mx-2">›</span>
              <Link href="/formations" className="hover:text-brand-700">
                Formations
              </Link>
              <span className="mx-2">›</span>
              <span className="text-brand-950">{formation.title}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-brand-950 sm:text-3xl">
                  {formation.title}
                </h1>
                {displayDuration && (
                  <p className="mt-2 text-sm font-medium text-brand-700">
                    {hasVideo
                      ? `Durée vidéo : ${displayDuration}`
                      : `Durée : ${displayDuration}`}
                  </p>
                )}

                <div className="mt-6">
                  <CourseMedia
                    mediaType={formation.mediaType}
                    mediaUrl={formation.mediaUrl}
                    videoUrl={formation.videoUrl}
                    image={formation.image}
                    title={formation.title}
                    onVideoDuration={onVideoDuration}
                  />
                </div>

                <div className="mt-6 rounded-[14px] bg-white p-6 shadow-card">
                  <h2 className="text-lg font-bold text-brand-950">
                    {activeModule?.title || "Leçon"}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-950/70">
                    {lessonText}
                  </p>
                  {activeModule && (
                    <div className="mt-5">
                      <Button
                        type="button"
                        variant={
                          completedIds.includes(activeModule.id)
                            ? "secondary"
                            : "success"
                        }
                        className="gap-2"
                        disabled={saving || !user}
                        onClick={() => toggleModuleComplete(activeModule.id)}
                      >
                        <Check className="h-4 w-4" />
                        {completedIds.includes(activeModule.id)
                          ? "Module terminé (annuler)"
                          : "Marquer le module comme terminé"}
                      </Button>
                      {saveMsg && (
                        <p className="mt-2 text-xs text-brand-950/50">
                          {saveMsg}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar progression — fixe hauteur + scroll */}
              <aside className="flex max-h-[min(70vh,640px)] flex-col overflow-hidden rounded-[14px] bg-white shadow-card lg:sticky lg:top-24">
                <div className="shrink-0 border-b border-brand-100 p-5 pb-4">
                  <h3 className="mb-3 text-sm font-bold text-brand-950">
                    Progression de la formation
                  </h3>
                  <ProgressBar value={progress} showLabel />
                </div>
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 pt-4">
                  {modules.map((mod) => {
                    const done = completedIds.includes(mod.id);
                    const active = mod.id === activeModule?.id;
                    return (
                      <li key={mod.id}>
                        <button
                          type="button"
                          onClick={() => setActiveModuleId(mod.id)}
                          className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            active
                              ? "bg-brand-100 font-semibold text-brand-700"
                              : "text-brand-950/80 hover:bg-brand-50"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-brand-500/40" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate">{mod.title}</span>
                            {hasVideo && displayDuration ? (
                              <span className="mt-0.5 block text-xs font-normal text-brand-950/40">
                                Vidéo · {displayDuration}
                              </span>
                            ) : !hasVideo && !isTextOnly && displayDuration ? (
                              <span className="mt-0.5 block text-xs font-normal text-brand-950/40">
                                {displayDuration}
                              </span>
                            ) : isTextOnly ? (
                              <span className="mt-0.5 block text-xs font-normal text-brand-950/40">
                                Texte
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          </div>
        )}
      </RequireAuth>
    </PublicShell>
  );
}
