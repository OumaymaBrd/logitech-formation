"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminEmail } from "@/lib/firebase";

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  // Ne pas renvoyer un admin vers une page client forcée
  return raw;
}

function ConnexionForm() {
  const { login, configured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const profile = await login(email.trim(), password);
      const admin =
        profile.role === "admin" || isAdminEmail(profile.email);

      if (admin) {
        router.replace("/admin");
        return;
      }

      if (profile.status === "accepted") {
        // Client accepté → espace client (ou page demandée si ce n'est pas admin)
        const dest =
          nextPath && !nextPath.startsWith("/admin")
            ? nextPath
            : "/dashboard";
        router.replace(dest);
      } else if (profile.status === "refused") {
        router.replace("/en-attente?status=refused");
      } else {
        router.replace("/en-attente");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[14px] bg-white p-6 shadow-card"
    >
      {!configured && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Firebase n&apos;est pas encore configuré.
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-semibold">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
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
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-xs text-brand-950/50">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-700">
          S&apos;inscrire
        </Link>
      </p>
    </form>
  );
}

export default function ConnexionPage() {
  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">Connexion</h1>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <p className="text-center text-sm text-brand-950/50">Chargement…</p>
          }
        >
          <ConnexionForm />
        </Suspense>
      </section>
    </PublicShell>
  );
}
