"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

function EnAttenteContent() {
  const params = useSearchParams();
  const refused = params.get("status") === "refused";
  const { profile, logout, isAccepted } = useAuth();

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

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-brand-950">
        {refused || profile?.status === "refused"
          ? "Inscription refusée"
          : "En attente de validation"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-950/70">
        {refused || profile?.status === "refused"
          ? "Un administrateur a refusé votre demande. Contactez le centre de formation pour plus d'informations."
          : "Votre compte a bien été créé. Un administrateur doit accepter votre inscription avant d'accéder à l'espace stagiaire."}
      </p>
      {profile?.email && (
        <p className="mt-2 text-xs text-brand-950/50">{profile.email}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="ghost">
          Accueil
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await logout();
            window.location.href = "/connexion";
          }}
        >
          Se déconnecter
        </Button>
      </div>
      <p className="mt-6 text-xs text-brand-950/40">
        Déjà validé ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700">
          Reconnectez-vous
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
