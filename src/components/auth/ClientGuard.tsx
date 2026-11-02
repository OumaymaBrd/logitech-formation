"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isAccepted, isPending, profile, configured } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (isAdmin) {
      router.replace("/admin");
      return;
    }
    if (isPending || profile?.status === "pending") {
      router.replace("/en-attente");
      return;
    }
    if (profile?.status === "refused") {
      router.replace("/en-attente?status=refused");
      return;
    }
    if (!isAccepted) {
      router.replace("/connexion");
    }
  }, [
    loading,
    configured,
    user,
    isAdmin,
    isAccepted,
    isPending,
    profile,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 text-sm text-brand-950/60">
        Vérification de la session…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-brand-950">Firebase non configuré</h1>
        <p className="mt-3 text-sm text-brand-950/70">
          Remplissez <code className="rounded bg-brand-100 px-1">.env.local</code>{" "}
          et activez Auth + Firestore.
        </p>
      </div>
    );
  }

  if (!user || isAdmin || !isAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 text-sm text-brand-950/60">
        Redirection…
      </div>
    );
  }

  return <>{children}</>;
}
