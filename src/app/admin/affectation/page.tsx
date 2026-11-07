"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { listUsers, type AppUser } from "@/lib/users";
import { listCourses } from "@/lib/courses";
import {
  getAssignedCourseIds,
  setAssignedCourses,
} from "@/lib/assignments";
import { notifyClientEmail } from "@/lib/notify";
import type { Course } from "@/lib/types";
import { useI18n } from "@/i18n/LanguageProvider";

function clientLabel(u: AppUser) {
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return name || u.email || u.uid;
}

export default function AffectationPage() {
  const { t } = useI18n();
  const [clients, setClients] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  /** uid → course ids affectés */
  const [assignMap, setAssignMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [listQuery, setListQuery] = useState("");

  // Modal formulaire
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const courseById = useMemo(() => {
    const m = new Map<string, Course>();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [users, courseList] = await Promise.all([
        listUsers(),
        listCourses({ publishedOnly: false, fallbackStatic: false }),
      ]);
      const accepted = users.filter(
        (u) => u.role === "client" && u.status === "accepted"
      );
      setClients(accepted);
      setCourses(courseList);

      const entries = await Promise.all(
        accepted.map(async (u) => {
          const ids = await getAssignedCourseIds(u.uid);
          return [u.uid, ids] as const;
        })
      );
      const map: Record<string, string[]> = {};
      for (const [uid, ids] of entries) map[uid] = ids;
      setAssignMap(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredClients = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return clients;
    const qDigits = q.replace(/\D/g, "");
    return clients.filter((u) => {
      const phoneDigits = (u.phone || "").replace(/\D/g, "");
      const hay =
        `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase();
      if (hay.includes(q)) return true;
      if (qDigits.length >= 2 && phoneDigits.includes(qDigits)) return true;
      return false;
    });
  }, [clients, listQuery]);

  const modalClientResults = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    // Ne rien afficher tant qu'il n'y a pas de recherche
    if (!q) return [];
    const qDigits = q.replace(/\D/g, "");
    return clients
      .filter((u) => {
        const phoneDigits = (u.phone || "").replace(/\D/g, "");
        const hay =
          `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase();
        if (hay.includes(q)) return true;
        // Recherche téléphone (chiffres uniquement)
        if (qDigits.length >= 2 && phoneDigits.includes(qDigits)) return true;
        return false;
      })
      .slice(0, 10);
  }, [clients, clientQuery]);

  const modalCourseResults = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const hay = `${c.title} ${c.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [courses, courseQuery]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.uid === selectedUserId) || null,
    [clients, selectedUserId]
  );

  function openCreate() {
    setSelectedUserId("");
    setSelectedCourseIds([]);
    setClientQuery("");
    setCourseQuery("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function openEdit(u: AppUser) {
    setSelectedUserId(u.uid);
    setClientQuery(clientLabel(u));
    setCourseQuery("");
    setError("");
    setSuccess("");
    setModalOpen(true);
    setLoadingAssign(true);
    try {
      const ids = await getAssignedCourseIds(u.uid);
      setSelectedCourseIds(ids);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de charger l'affectation"
      );
      setSelectedCourseIds(assignMap[u.uid] || []);
    } finally {
      setLoadingAssign(false);
    }
  }

  function pickClient(u: AppUser) {
    setSelectedUserId(u.uid);
    setClientQuery(clientLabel(u));
    setLoadingAssign(true);
    getAssignedCourseIds(u.uid)
      .then((ids) => setSelectedCourseIds(ids))
      .catch(() => setSelectedCourseIds(assignMap[u.uid] || []))
      .finally(() => setLoadingAssign(false));
  }

  function toggleCourse(id: string) {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSave() {
    if (!selectedUserId) {
      setError("Choisissez un client.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const previousIds = assignMap[selectedUserId] || [];
      const ids = await setAssignedCourses(selectedUserId, selectedCourseIds);
      setAssignMap((prev) => ({ ...prev, [selectedUserId]: ids }));

      // Email stylé uniquement pour les nouvelles formations ajoutées
      const newlyAdded = ids.filter((id) => !previousIds.includes(id));
      if (newlyAdded.length > 0 && selectedClient?.email) {
        const courses = newlyAdded
          .map((id) => courseById.get(id))
          .filter(Boolean)
          .map((c) => ({
            title: c!.title,
            slug: c!.slug,
            category: c!.category || "",
            duration: c!.duration || "",
          }));
        void notifyClientEmail({
          type: "assignment",
          to: selectedClient.email,
          firstName: selectedClient.firstName,
          lastName: selectedClient.lastName,
          courses,
        });
      }

      setSuccess(
        `Affectation enregistrée : ${ids.length} formation(s) pour ${clientLabel(selectedClient!)}.` +
          (newlyAdded.length > 0
            ? ` Email envoyé pour ${newlyAdded.length} nouvelle(s).`
            : "")
      );
      setModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-950/50">
        Chargement des clients et formations…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-brand-950 sm:text-2xl">
            {t.admin.assignment}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-brand-950/60">
            {t.admin.assignmentSubtitle}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full gap-2 sm:w-auto"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          {t.admin.newAssignment}
        </Button>
      </div>

      {error && !modalOpen && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/45" />
        <input
          type="search"
          value={listQuery}
          onChange={(e) => setListQuery(e.target.value)}
          placeholder="Rechercher : prénom, nom, email, téléphone…"
          className="w-full rounded-xl border border-brand-100 bg-white py-2.5 ps-10 pe-3 text-sm outline-none ring-brand-500 focus:ring-2"
        />
      </div>

      {filteredClients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-100 bg-white py-14 text-center text-sm text-brand-950/55 shadow-soft">
          {clients.length === 0
            ? "Aucun client accepté. Acceptez d'abord un compte dans Utilisateurs."
            : "Aucun client ne correspond à votre recherche."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-soft">
          <table className="w-full min-w-[520px] text-start text-sm">
            <thead className="border-b border-brand-100 bg-brand-50/80 text-xs font-bold uppercase tracking-wider text-brand-700">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="hidden px-4 py-3 sm:table-cell">Formations</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filteredClients.map((u) => {
                const ids = assignMap[u.uid] || [];
                const titles = ids
                  .map((id) => courseById.get(id)?.title)
                  .filter(Boolean) as string[];
                return (
                  <tr key={u.uid} className="hover:bg-brand-50/40">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-brand-950">
                        {clientLabel(u)}
                      </p>
                      <p className="truncate text-xs text-brand-950/45">
                        {u.email}
                      </p>
                      <p className="mt-1 text-xs text-brand-950/50 sm:hidden">
                        {ids.length === 0
                          ? "Aucune formation"
                          : `${ids.length} formation(s)`}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      {ids.length === 0 ? (
                        <span className="text-xs text-brand-950/45">
                          Aucune formation
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {titles.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-lg bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
                            >
                              {t}
                            </span>
                          ))}
                          {titles.length > 3 && (
                            <span className="text-xs text-brand-950/45">
                              +{titles.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="gap-1.5 !px-3 !py-1.5"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-stretch justify-center bg-brand-950/55 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="flex h-[100dvh] w-full max-w-xl flex-col overflow-hidden rounded-none bg-white shadow-xl sm:h-auto sm:max-h-[min(92dvh,720px)] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-100 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-brand-950 sm:text-lg">
                  {selectedUserId
                    ? "Modifier l'affectation"
                    : "Nouvelle affectation"}
                </h2>
                <p className="mt-0.5 text-xs text-brand-950/50">
                  Recherchez un client, puis cochez les formations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="shrink-0 rounded-xl p-2 text-brand-950/45 hover:bg-brand-50"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 [-webkit-overflow-scrolling:touch]">
              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {/* Client */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-brand-700">
                  Client *
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40" />
                  <input
                    type="search"
                    value={clientQuery}
                    onChange={(e) => {
                      setClientQuery(e.target.value);
                      if (selectedUserId) setSelectedUserId("");
                    }}
                    placeholder="Rechercher : prénom, nom, email ou téléphone…"
                    className="w-full rounded-xl border border-brand-100 py-2.5 ps-10 pe-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {selectedClient ? (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-brand-700 bg-brand-50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-brand-950">
                        {clientLabel(selectedClient)}
                      </p>
                      <p className="break-all text-xs text-brand-950/50">
                        {selectedClient.email}
                        {selectedClient.phone
                          ? ` · ${selectedClient.phone}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserId("");
                        setClientQuery("");
                        setSelectedCourseIds([]);
                      }}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-white"
                    >
                      Changer
                    </button>
                  </div>
                ) : clientQuery.trim() ? (
                  <ul className="mt-2 max-h-36 overflow-y-auto overscroll-contain rounded-xl border border-brand-100 sm:max-h-40">
                    {modalClientResults.length === 0 ? (
                      <li className="px-3 py-3 text-xs text-brand-950/45">
                        Aucun client trouvé pour « {clientQuery.trim()} ».
                      </li>
                    ) : (
                      modalClientResults.map((u) => (
                        <li key={u.uid}>
                          <button
                            type="button"
                            onClick={() => pickClient(u)}
                            className="w-full px-3 py-2.5 text-start text-sm hover:bg-brand-50"
                          >
                            <span className="block font-semibold text-brand-950">
                              {clientLabel(u)}
                            </span>
                            <span className="block truncate text-xs text-brand-950/45">
                              {u.email}
                              {u.phone ? ` · ${u.phone}` : ""}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-brand-950/45">
                    Commencez à taper pour rechercher un client.
                  </p>
                )}
              </div>

              {/* Formations */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                    Formations
                  </label>
                  {selectedUserId && courses.length > 0 && (
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-brand-700">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCourseIds(courses.map((c) => c.id))
                        }
                        className="hover:underline"
                      >
                        Tout cocher
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseIds([])}
                        className="hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40" />
                  <input
                    type="search"
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder="Rechercher une formation…"
                    disabled={!selectedUserId}
                    className="w-full rounded-xl border border-brand-100 py-2.5 ps-10 pe-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-brand-50 disabled:opacity-60"
                  />
                </div>

                {!selectedUserId ? (
                  <p className="rounded-xl border border-dashed border-brand-100 py-8 text-center text-sm text-brand-950/45">
                    Sélectionnez d&apos;abord un client.
                  </p>
                ) : loadingAssign ? (
                  <p className="py-8 text-center text-sm text-brand-950/45">
                    Chargement…
                  </p>
                ) : modalCourseResults.length === 0 ? (
                  <p className="py-8 text-center text-sm text-brand-950/45">
                    Aucune formation trouvée.
                  </p>
                ) : (
                  <ul className="space-y-1.5 pb-2">
                    {modalCourseResults.map((c) => {
                      const checked = selectedCourseIds.includes(c.id);
                      return (
                        <li key={c.id}>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                              checked
                                ? "border-brand-700 bg-brand-50"
                                : "border-brand-100 hover:bg-brand-50/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 accent-brand-700"
                              checked={checked}
                              onChange={() => toggleCourse(c.id)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-semibold text-brand-950">
                                {c.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-brand-950/45">
                                {c.category || "Sans catégorie"} ·{" "}
                                {c.published ? "Publié" : "Brouillon"}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-brand-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <p className="text-center text-xs text-brand-950/50 sm:text-start">
                {selectedCourseIds.length} formation(s) sélectionnée(s)
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full gap-2"
                  disabled={saving || !selectedUserId}
                  onClick={onSave}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
