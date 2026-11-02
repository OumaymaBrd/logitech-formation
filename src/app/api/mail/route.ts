import { NextResponse } from "next/server";
import { sendAcceptedEmail, sendWelcomeEmail } from "@/lib/mail";

type MailType = "welcome" | "accepted";

type Body = {
  type?: MailType;
  to?: string;
  firstName?: string;
  lastName?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const type = body.type;
  const to = (body.to || "").trim().toLowerCase();
  if (!type || (type !== "welcome" && type !== "accepted")) {
    return NextResponse.json(
      { error: "type doit être welcome ou accepted" },
      { status: 400 }
    );
  }
  if (!to.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const payload = {
    to,
    firstName: body.firstName?.trim() || "",
    lastName: body.lastName?.trim() || "",
  };

  try {
    const result =
      type === "welcome"
        ? await sendWelcomeEmail(payload)
        : await sendAcceptedEmail(payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          skipped: true,
          reason: "reason" in result ? result.reason : "Email non configuré",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: result.provider,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Envoi email impossible";
    console.error("[api/mail]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
