"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { formations } from "@/lib/data";
import { notifyClientEmail } from "@/lib/notify";

export default function InscriptionPage() {
  const { registerClient, configured } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [formationSlug, setFormationSlug] = useState(formations[0]?.slug ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
      }
      await registerClient({
        firstName,
        lastName,
        email,
        phone,
        password,
        formationSlug,
      });
      // Email stylé : compte créé, en attente de validation admin
      void notifyClientEmail({
        type: "welcome",
        to: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      router.replace("/en-attente");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Inscription impossible";
      if (msg.includes("email-already-in-use")) {
        setError("Cet email est déjà utilisé. Connectez-vous.");
      } else {
        setError(msg);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">Inscription</h1>
          <p className="mt-2 text-sm text-white/70">
            Créez votre compte client.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-[14px] bg-white p-6 shadow-card"
        >
          {!configured && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Firebase n&apos;est pas encore configuré (.env.local + Auth + Firestore).
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Prénom *</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Nom *</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="+212 6XX-XXXXXX"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              Mot de passe *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              Formation souhaitée
            </label>
            <select
              value={formationSlug}
              onChange={(e) => setFormationSlug(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {formations.map((f) => (
                <option key={f.id} value={f.slug}>
                  {f.title} — {f.price.toLocaleString("fr-MA")} DH
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={pending || !configured}
          >
            {pending ? "Inscription…" : "Valider mon inscription"}
          </Button>
          <p className="text-center text-xs text-brand-950/50">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-semibold text-brand-700">
              Se connecter
            </Link>
          </p>
        </form>
      </section>
    </PublicShell>
  );
}
