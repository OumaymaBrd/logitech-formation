"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formations } from "@/lib/data";
import {
  listUsers,
  setUserStatus,
  type AppUser,
  type UserStatus,
} from "@/lib/users";
import { notifyClientEmail } from "@/lib/notify";

function statusLabel(s: UserStatus) {
  if (s === "accepted") return "Accepté";
  if (s === "refused") return "Refusé";
  return "En attente";
}

function statusClass(s: UserStatus) {
  if (s === "accepted") return "bg-green-100 text-green-800";
  if (s === "refused") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | UserStatus>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listUsers();
      setUsers(list.filter((u) => u.role === "client"));
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

  async function updateStatus(uid: string, status: UserStatus) {
    setBusyId(uid);
    setError("");
    try {
      const user = users.find((u) => u.uid === uid);
      await setUserStatus(uid, status);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status } : u))
      );
      // Email stylé + lien espace après acceptation admin
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
        <h1 className="text-2xl font-extrabold text-brand-950">Utilisateurs</h1>
        <p className="mt-1 text-sm text-brand-950/60">
          Acceptez ou refusez les inscriptions clients. Seuls les comptes
          acceptés accèdent à l&apos;espace stagiaire.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "En attente"],
            ["accepted", "Acceptés"],
            ["refused", "Refusés"],
            ["all", "Tous"],
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
            const formation =
              formations.find((f) => f.slug === u.formationSlug)?.title ||
              u.formationSlug ||
              "—";
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
                    {u.phone || "Pas de téléphone"} · {formation}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClass(u.status)}`}
                  >
                    {statusLabel(u.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
