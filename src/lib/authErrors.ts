/** Traduit les erreurs Firebase Auth en messages clairs (FR). */
export function friendlyAuthError(
  err: unknown,
  fallback = "Une erreur est survenue. Réessayez."
): string {
  const raw =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code || "")
      : "";
  const message = err instanceof Error ? err.message : String(err || "");
  const hay = `${raw} ${message}`.toLowerCase();

  if (
    hay.includes("auth/invalid-credential") ||
    hay.includes("auth/wrong-password") ||
    hay.includes("auth/user-not-found") ||
    hay.includes("invalid-credential") ||
    hay.includes("wrong-password")
  ) {
    return "Email ou mot de passe incorrect.";
  }
  if (hay.includes("auth/invalid-email") || hay.includes("invalid-email")) {
    return "Adresse email invalide.";
  }
  if (
    hay.includes("auth/email-already-in-use") ||
    hay.includes("email-already-in-use")
  ) {
    return "Cet email est déjà utilisé. Connectez-vous.";
  }
  if (
    hay.includes("auth/weak-password") ||
    hay.includes("weak-password")
  ) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (
    hay.includes("auth/too-many-requests") ||
    hay.includes("too-many-requests")
  ) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (
    hay.includes("auth/network-request-failed") ||
    hay.includes("network-request-failed")
  ) {
    return "Problème de connexion réseau. Vérifiez votre internet.";
  }
  if (
    hay.includes("auth/user-disabled") ||
    hay.includes("user-disabled")
  ) {
    return "Ce compte a été désactivé. Contactez l'administrateur.";
  }
  if (
    hay.includes("auth/requires-recent-login") ||
    hay.includes("requires-recent-login")
  ) {
    return "Pour des raisons de sécurité, reconnectez-vous puis réessayez.";
  }
  if (hay.includes("firebase non configuré") || hay.includes("firebase")) {
    if (hay.includes("auth/")) {
      return "Connexion impossible. Vérifiez vos identifiants.";
    }
  }

  // Ne pas afficher les messages techniques Firebase bruts
  if (hay.includes("firebase:") || hay.includes("auth/")) {
    return fallback;
  }

  return message || fallback;
}
