/** Déclenche un email côté serveur (ne bloque pas l'UX si échec). */
export async function notifyClientEmail(opts: {
  type: "welcome" | "accepted";
  to: string;
  firstName?: string;
  lastName?: string;
}) {
  try {
    const res = await fetch("/api/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: opts.type,
        to: opts.to,
        firstName: opts.firstName || "",
        lastName: opts.lastName || "",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("[notifyClientEmail]", err);
    return { ok: false, error: "network" };
  }
}
