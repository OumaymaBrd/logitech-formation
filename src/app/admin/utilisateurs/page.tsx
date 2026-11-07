"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formations } from "@/lib/data";
import { listCourses } from "@/lib/courses";
import { getAssignedCourseIds } from "@/lib/assignments";
import {
  listUsers,
  setUserStatus,
  type AppUser,
  type UserStatus,
} from "@/lib/users";
import { notifyClientEmail } from "@/lib/notify";
import type { Course } from "@/lib/types";
import { useI18n } from "@/i18n/LanguageProvider";

function statusLabel(s: UserStatus, labels: { accepted: string; refused: string; pending: string }) {
  if (s === "accepted") return labels.accepted;
  if (s === "refused") return labels.refused;
  return labels.pending;
}

function statusClass(s: UserStatus) {
  if (s === "accepted") return "bg-green-100 text-green-800";
  if (s === "refused") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-brand-50 py-3 last:border-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-brand-950">
        {value || "—"}
      </p>
    </div>
  );
}

export default function AdminUtilisateursPage() {
  const { t } = useI18n();
  const statusText = {
    accepted: t.admin.statusAccepted,
    refused: t.admin.statusRefused,
    pending: t.admin.statusPending,
  };
  const [users, setUsers] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | UserStatus>("pending");
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [assignedTitles, setAssignedTitles] = useState<string[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const courseTitleBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of formations) map.set(f.slug, f.title);
    for (const c of courses) {
      if (c.slug) map.set(c.slug, c.title);
    }
    return map;
  }, [courses]);

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) map.set(c.id, c.title);
    return map;
  }, [courses]);

  function formationLabel(slug: string) {
    if (!slug) return "—";
    return courseTitleBySlug.get(slug) || slug;
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, courseList] = await Promise.all([
        listUsers(),
        listCourses({ publishedOnly: false, fallbackStatic: false }),
      ]);
      setUsers(list.filter((u) => u.role === "client"));
      setCourses(courseList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les utilisateurs (Firestore ?)"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(u: AppUser) {
    setSelected(u);
    setAssignedTitles([]);
    setLoadingDetail(true);
    try {
      const ids = await getAssignedCourseIds(u.uid);
      setAssignedTitles(
        ids.map((id) => courseTitleById.get(id) || id).filter(Boolean)
      );
    } catch {
      setAssignedTitles([]);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function updateStatus(uid: string, status: UserStatus) {
    setBusyId(uid);
    setError("");
    try {
      const user = users.find((u) => u.uid === uid);
      await setUserStatus(uid, status);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status } : u))
      );
      setSelected((prev) => (prev?.uid === uid ? { ...prev, status } : prev));
      if (status === "accepted" && user?.email) {
        void notifyClientEmail({
          type: "accepted",
          to: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  }

  const visible =
    filter === "all" ? users : users.filter((u) => u.status === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">
          {t.admin.users}
        </h1>
        <p className="mt-1 text-sm text-brand-950/60">{t.admin.usersSubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", t.admin.pendingFilter],
            ["accepted", t.admin.acceptedFilter],
            ["refused", t.admin.refusedFilter],
            ["all", t.admin.allFilter],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
              filter === value
                ? "bg-brand-700 text-white"
                : "bg-brand-100 text-brand-700"
            }`}
          >
            {label}
          </button>
        ))}
        <Button type="button" variant="ghost" onClick={load} className="ml-auto">
          Actualiser
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-brand-950/50">Chargement…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-[14px] bg-white p-6 text-sm text-brand-950/60 shadow-soft">
          Aucun utilisateur dans cette catégorie.
        </p>
      ) : (
        <ul className="divide-y divide-brand-100 overflow-hidden rounded-[14px] bg-white shadow-soft">
          {visible.map((u) => {
            const formation = formationLabel(u.formationSlug);
            return (
              <li
                key={u.uid}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brand-950">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="truncate text-sm text-brand-950/60">{u.email}</p>
                  <p className="text-xs text-brand-950/45">
                    {u.phone || "Pas de téléphone"}
                    {u.formationSlug ? ` · ${formation}` : ""}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClass(u.status)}`}
                  >
                    {statusLabel(u.status, statusText)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-1.5"
                    onClick={() => openDetail(u)}
                  >
                    <Eye className="h-4 w-4" />
                    Voir détail
                  </Button>
                  {u.status !== "accepted" && (
                    <Button
                      type="button"
                      variant="success"
                      disabled={busyId === u.uid}
                      onClick={() => updateStatus(u.uid, "accepted")}
                    >
                      Accepter
                    </Button>
                  )}
                  {u.status !== "refused" && (
                    <Button
                      type="button"
                      variant="danger"
                      disabled={busyId === u.uid}
                      onClick={() => updateStatus(u.uid, "refused")}
                    >
                      Refuser
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-detail-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-brand-100 bg-white px-5 py-4">
              <div>
                <h2
                  id="user-detail-title"
                  className="text-lg font-extrabold text-brand-950"
                >
                  Détail du client
                </h2>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClass(selected.status)}`}
                >
                  {statusLabel(selected.status, statusText)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-brand-950/50 hover:bg-brand-50 hover:text-brand-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-2">
              <DetailRow
                label="Prénom"
                value={selected.firstName || "—"}
              />
              <DetailRow label="Nom" value={selected.lastName || "—"} />
              <DetailRow label="Email" value={selected.email || "—"} />
              <DetailRow
                label="Téléphone"
                value={selected.phone || "Non renseigné"}
              />
              {selected.formationSlug ? (
                <DetailRow
                  label="Formation souhaitée (inscription)"
                  value={formationLabel(selected.formationSlug)}
                />
              ) : null}
              <DetailRow
                label="Inscription le"
                value={formatDate(selected.createdAt)}
              />
              <DetailRow
                label="Dernière mise à jour"
                value={formatDate(selected.updatedAt)}
              />
              <DetailRow
                label="Formations affectées"
                value={
                  loadingDetail
                    ? "Chargement…"
                    : assignedTitles.length > 0
                      ? assignedTitles.join(", ")
                      : "Aucune pour le moment"
                }
              />
            </div>

            <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-brand-100 bg-white px-5 py-4">
              {selected.status !== "accepted" && (
                <Button
                  type="button"
                  variant="success"
                  disabled={busyId === selected.uid}
                  onClick={() => updateStatus(selected.uid, "accepted")}
                >
                  Accepter
                </Button>
              )}
              {selected.status !== "refused" && (
                <Button
                  type="button"
                  variant="danger"
                  disabled={busyId === selected.uid}
                  onClick={() => updateStatus(selected.uid, "refused")}
                >
                  Refuser
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="ml-auto"
                onClick={() => setSelected(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
