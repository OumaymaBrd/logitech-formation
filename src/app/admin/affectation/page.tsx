"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { listUsers, type AppUser } from "@/lib/users";
import { listCourses } from "@/lib/courses";
import {
  getAssignedCourseIds,
  setAssignedCourses,
} from "@/lib/assignments";
import type { Course } from "@/lib/types";

function clientLabel(u: AppUser) {
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return name || u.email || u.uid;
}

export default function AffectationPage() {
  const [clients, setClients] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      listUsers(),
      listCourses({ publishedOnly: false, fallbackStatic: false }),
    ])
      .then(([users, courseList]) => {
        setClients(
          users.filter((u) => u.role === "client" && u.status === "accepted")
        );
        setCourses(courseList);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Chargement impossible")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedCourseIds([]);
      return;
    }
    let cancelled = false;
    setLoadingAssign(true);
    setSuccess("");
    getAssignedCourseIds(selectedUserId)
      .then((ids) => {
        if (!cancelled) setSelectedCourseIds(ids);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Impossible de charger l'affectation"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAssign(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.uid === selectedUserId) || null,
    [clients, selectedUserId]
  );

  function toggleCourse(id: string) {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSuccess("");
  }

  function selectAll() {
    setSelectedCourseIds(courses.map((c) => c.id));
    setSuccess("");
  }

  function clearAll() {
    setSelectedCourseIds([]);
    setSuccess("");
  }

  async function onSave() {
    if (!selectedUserId) {
      setError("Choisissez un client.");
      return;
    }
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await setAssignedCourses(selectedUserId, selectedCourseIds);
      setSuccess(
        `Affectation enregistrée : ${selectedCourseIds.length} formation(s) pour ${clientLabel(selectedClient!)}.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-950/50">Chargement des clients et formations…</p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">Affectation</h1>
        <p className="mt-1 text-sm text-brand-950/60">
          Choisissez un client et les formations qu&apos;il peut voir. Même
          publiées, les autres restent invisibles pour lui. L&apos;admin voit
          toutes les formations.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Clients */}
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
            <UserRound className="h-4 w-4" />
            Client
          </h2>
          {clients.length === 0 ? (
            <p className="text-xs text-brand-950/50">
              Aucun client accepté pour le moment.
            </p>
          ) : (
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
              {clients.map((u) => {
                const active = u.uid === selectedUserId;
                return (
                  <li key={u.uid}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(u.uid)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-brand-700 text-white"
                          : "text-brand-950 hover:bg-brand-50"
                      }`}
                    >
                      <span className="block font-semibold">
                        {clientLabel(u)}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                          active ? "text-white/70" : "text-brand-950/45"
                        }`}
                      >
                        {u.email}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Formations */}
        <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Formations à affecter
            </h2>
            {selectedUserId && courses.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Tout cocher
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Tout décocher
                </button>
              </div>
            )}
          </div>

          {!selectedUserId ? (
            <p className="py-10 text-center text-sm text-brand-950/50">
              Sélectionnez un client à gauche.
            </p>
          ) : loadingAssign ? (
            <p className="py-10 text-center text-sm text-brand-950/50">
              Chargement de l&apos;affectation…
            </p>
          ) : courses.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-950/50">
              Aucune formation créée.
            </p>
          ) : (
            <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
              {courses.map((c) => {
                const checked = selectedCourseIds.includes(c.id);
                return (
                  <li key={c.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${
                        checked
                          ? "border-brand-700 bg-brand-50"
                          : "border-brand-100 hover:bg-brand-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-brand-700"
                        checked={checked}
                        onChange={() => toggleCourse(c.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-brand-950">
                          {c.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-brand-950/50">
                          {c.category} · {c.published ? "Publié" : "Brouillon"}
                        </span>
                      </span>
                      {checked && (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {selectedUserId && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-100 pt-4">
              <p className="text-xs text-brand-950/55">
                {selectedCourseIds.length} formation(s) sélectionnée(s)
              </p>
              <Button
                type="button"
                variant="primary"
                className="gap-2"
                disabled={saving}
                onClick={onSave}
              >
                <Save className="h-4 w-4" />
                {saving ? "Enregistrement…" : "Enregistrer l'affectation"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
