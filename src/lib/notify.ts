import type { AssignedCourseMail } from "@/lib/mail";

/** Déclenche un email côté serveur (ne bloque pas l'UX si échec). */
export async function notifyClientEmail(opts: {
  type: "welcome" | "accepted" | "assignment";
  to: string;
  firstName?: string;
  lastName?: string;
  courses?: AssignedCourseMail[];
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
        courses: opts.courses || [],
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("[notifyClientEmail]", err);
    return { ok: false, error: "network" };
  }
}
