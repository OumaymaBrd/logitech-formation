"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Accès formations / e-learning :
 * - admin connecté OK
 * - client avec statut « accepted » OK
 * - sinon → connexion ou page d'attente
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isAccepted, isPending } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = Boolean(user && (isAdmin || isAccepted));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isPending) {
      router.replace("/en-attente");
      return;
    }
    if (!isAdmin && !isAccepted) {
      router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, isAdmin, isAccepted, isPending, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-brand-950/60">
        Vérification de la connexion…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-brand-950/60">
        Redirection…
      </div>
    );
  }

  return <>{children}</>;
}
