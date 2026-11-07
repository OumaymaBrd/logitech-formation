import { Resend } from "resend";
import nodemailer from "nodemailer";

export type MailPayload = {
  to: string;
  firstName?: string;
  lastName?: string;
};

export type AssignedCourseMail = {
  title: string;
  slug: string;
  category?: string;
  duration?: string;
};

export type AssignmentMailPayload = MailPayload & {
  courses: AssignedCourseMail[];
};

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function fromAddress() {
  return (
    process.env.EMAIL_FROM ||
    "Logitech Formation <onboarding@resend.dev>"
  );
}

function displayName(p: MailPayload) {
  const n = `${p.firstName || ""} ${p.lastName || ""}`.trim();
  return n || "Bonjour";
}

function emailLayout(opts: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const brand = "#5b21b6"; // brand-700 approx
  const dark = "#1e0a3c";

  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<tr>
          <td style="padding:8px 32px 28px;">
            <a href="${opts.ctaHref}"
               style="display:inline-block;background:${brand};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
              ${opts.ctaLabel}
            </a>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f0fa;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0fa;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(30,10,60,0.08);">
          <tr>
            <td style="background:${dark};padding:26px 32px;text-align:center;">
              <div style="font-size:20px;font-weight:800;letter-spacing:0.04em;color:#ffffff;line-height:1.2;">
                LOGITECH <span style="color:#c4b5fd;">FORMATIONATION</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:${dark};">${opts.title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px;color:#3f3f46;font-size:15px;line-height:1.6;">
              ${opts.bodyHtml}
            </td>
          </tr>
          ${cta}
        </table>
        <p style="margin:16px 0 0;color:#a1a1aa;font-size:11px;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildWelcomeEmail(p: MailPayload) {
  const name = displayName(p);
  const html = emailLayout({
    title: "Compte créé avec succès",
    preheader: "Votre inscription Logitech Formation est en cours de validation.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Bonjour <strong>${name}</strong>,</p>
      <p style="margin:0 0 12px;">
        Votre compte a bien été créé sur <strong>Logitech Formation</strong>.
      </p>
      <p style="margin:0 0 12px;">
        Un administrateur doit encore <strong>accepter votre inscription</strong>
        avant que vous puissiez accéder à l&apos;espace étudiant et aux formations.
      </p>
      <p style="margin:0;">
        Vous recevrez un nouvel email dès que votre compte sera validé.
      </p>
    `,
    ctaLabel: "Voir le site",
    ctaHref: appUrl(),
  });
  return {
    subject: "Logitech Formation — Compte créé, en attente de validation",
    html,
  };
}

export function buildAcceptedEmail(p: MailPayload) {
  const name = displayName(p);
  const spaceUrl = `${appUrl()}/connexion?next=${encodeURIComponent("/dashboard")}`;
  const html = emailLayout({
    title: "Votre compte a été accepté",
    preheader: "Accédez dès maintenant à votre espace étudiant.",
    bodyHtml: `
      <p style="margin:0 0 12px;">Bonjour <strong>${name}</strong>,</p>
      <p style="margin:0 0 12px;">
        Bonne nouvelle : un administrateur a <strong>accepté votre compte</strong>
        Logitech Formation.
      </p>
      <p style="margin:0 0 12px;">
        Vous pouvez maintenant vous connecter et accéder à votre espace étudiant
        pour consulter les formations qui vous seront affectées.
      </p>
      <p style="margin:0;">
        Utilisez le bouton ci-dessous pour vous reconnecter.
      </p>
    `,
    ctaLabel: "Accéder à mon espace",
    ctaHref: spaceUrl,
  });
  return {
    subject: "Logitech Formation — Compte accepté, accédez à votre espace",
    html,
  };
}

async function sendViaResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [to],
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return true;
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject,
    html,
  });
  return true;
}

/** Envoie un email (Resend prioritaire, sinon SMTP). Retourne false si non configuré. */
export async function sendMail(to: string, subject: string, html: string) {
  if (!to?.includes("@")) throw new Error("Email destinataire invalide");

  const viaResend = await sendViaResend(to, subject, html);
  if (viaResend) return { ok: true as const, provider: "resend" as const };

  const viaSmtp = await sendViaSmtp(to, subject, html);
  if (viaSmtp) return { ok: true as const, provider: "smtp" as const };

  return {
    ok: false as const,
    skipped: true as const,
    reason: "Aucun fournisseur email configuré (RESEND_API_KEY ou SMTP_*)",
  };
}

export function buildAssignmentEmail(p: AssignmentMailPayload) {
  const name = displayName(p);
  const courses = p.courses || [];
  const count = courses.length;
  const brand = "#5b21b6";
  const listHtml =
    courses.length === 0
      ? "<p>Aucune formation.</p>"
      : `<ul style="margin:12px 0 16px;padding:0;list-style:none;">
          ${courses
            .map((c) => {
              const href = `${appUrl()}/formations/${encodeURIComponent(c.slug)}`;
              const meta = [c.category, c.duration].filter(Boolean).join(" · ");
              return `<li style="margin:0 0 10px;padding:12px 14px;border:1px solid #eee8fa;border-radius:12px;background:#f7f4fc;">
                <div style="font-weight:700;color:#1e0a3c;font-size:15px;">${c.title}</div>
                ${meta ? `<div style="margin-top:4px;font-size:12px;color:#71717a;">${meta}</div>` : ""}
                <a href="${href}" style="display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:${brand};text-decoration:none;">
                  Ouvrir la formation →
                </a>
              </li>`;
            })
            .join("")}
        </ul>`;

  const ctaHref =
    count === 1 && courses[0]?.slug
      ? `${appUrl()}/connexion?next=${encodeURIComponent(`/formations/${courses[0].slug}`)}`
      : `${appUrl()}/connexion?next=${encodeURIComponent("/dashboard/formations")}`;

  const html = emailLayout({
    title:
      count === 1
        ? "Nouvelle formation affectée"
        : `${count} formations vous ont été affectées`,
    preheader:
      count === 1
        ? `Formation : ${courses[0]?.title || ""}`
        : `${count} formations sont disponibles dans votre espace.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Bonjour <strong>${name}</strong>,</p>
      <p style="margin:0 0 12px;">
        Un administrateur vous a affecté
        <strong>${count} formation${count > 1 ? "s" : ""}</strong>
        sur <strong>Logitech Formation</strong>.
      </p>
      ${listHtml}
      <p style="margin:0;">
        Connectez-vous pour y accéder depuis votre espace étudiant.
      </p>
    `,
    ctaLabel: count === 1 ? "Voir la formation" : "Voir mes formations",
    ctaHref,
  });

  const subject =
    count === 1
      ? `Logitech Formation — Formation affectée : ${courses[0]?.title || ""}`
      : `Logitech Formation — ${count} formations vous ont été affectées`;

  return { subject, html };
}

export async function sendWelcomeEmail(p: MailPayload) {
  const { subject, html } = buildWelcomeEmail(p);
  return sendMail(p.to, subject, html);
}

export async function sendAcceptedEmail(p: MailPayload) {
  const { subject, html } = buildAcceptedEmail(p);
  return sendMail(p.to, subject, html);
}

export async function sendAssignmentEmail(p: AssignmentMailPayload) {
  if (!p.courses?.length) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "Aucune formation à notifier",
    };
  }
  const { subject, html } = buildAssignmentEmail(p);
  return sendMail(p.to, subject, html);
}
