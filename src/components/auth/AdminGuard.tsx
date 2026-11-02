"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { hasCachedAdminSession } from "@/lib/firebase";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  // Toujours false au 1er rendu (serveur = client) → pas d'erreur hydration
  const [mounted, setMounted] = useState(false);
  const [cachedAdmin, setCachedAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCachedAdmin(hasCachedAdminSession());
  }, []);

  useEffect(() => {
    if (!mounted || loading || isLogin) return;
    if (!configured) return;
    if (!user || !isAdmin) {
      router.replace("/admin/login");
    }
  }, [mounted, loading, user, isAdmin, configured, isLogin, router]);

  if (isLogin) return <>{children}</>;

  // Avant montage : même UI serveur/client (évite hydration mismatch)
  if (!mounted || loading) {
    if (mounted && cachedAdmin) {
      return <>{children}</>;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 text-sm text-brand-950/60">
        Restauration de la session…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-brand-950">Firebase non configuré</h1>
        <p className="mt-3 text-sm text-brand-950/70">
          Créez un fichier <code className="rounded bg-brand-100 px-1">.env.local</code>{" "}
          et activez Authentication + Firestore.
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 text-sm text-brand-950/60">
        Redirection vers la connexion admin…
      </div>
    );
  }

  return <>{children}</>;
}
