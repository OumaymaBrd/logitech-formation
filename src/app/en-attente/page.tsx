"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

function EnAttenteContent() {
  const params = useSearchParams();
  const refused = params.get("status") === "refused";
  const emailFromQuery = params.get("email") || "";
  const { user, profile, logout, isAccepted, isAdmin, loading } = useAuth();

  // Si une session « en attente » existe encore → déconnexion
  useEffect(() => {
    if (loading) return;
    if (!user || isAdmin || isAccepted) return;
    void logout();
  }, [loading, user, isAdmin, isAccepted, logout]);

  if (isAccepted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-brand-950">Compte validé</h1>
        <p className="mt-2 text-sm text-brand-950/70">
          Votre accès est accepté.
        </p>
        <Button href="/dashboard" variant="primary" className="mt-6">
          Aller à mon espace
        </Button>
      </div>
    );
  }

  const shownEmail = emailFromQuery || profile?.email || "";
  const isRefused = refused || profile?.status === "refused";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-brand-950">
        {isRefused ? "Inscription refusée" : "En attente de validation"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-950/70">
        {isRefused
          ? "Un administrateur a refusé votre demande. Contactez le centre de formation pour plus d'informations."
          : "Votre compte a bien été créé. Un administrateur doit accepter votre inscription avant que vous puissiez vous connecter à votre espace."}
      </p>
      {shownEmail && (
        <p className="mt-2 text-xs text-brand-950/50">{shownEmail}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="ghost">
          Accueil
        </Button>
        <Button href="/connexion" variant="primary">
          Se connecter
        </Button>
      </div>
      <p className="mt-6 text-xs text-brand-950/40">
        Déjà validé par l&apos;admin ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}

export default function EnAttentePage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-brand-950/50">
            Chargement…
          </div>
        }
      >
        <EnAttenteContent />
      </Suspense>
    </PublicShell>
  );
}
