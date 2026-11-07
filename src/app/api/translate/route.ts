import { NextRequest, NextResponse } from "next/server";
import { googleTranslateText } from "@/lib/googleTranslate";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      text?: string;
      texts?: string[];
      from?: string;
      to?: string;
    };

    const from = body.from || "fr";
    const to = body.to || "ar";

    if (Array.isArray(body.texts)) {
      const results: string[] = [];
      for (const t of body.texts) {
        results.push(
          await googleTranslateText(String(t ?? ""), { from, to })
        );
      }
      return NextResponse.json({ translations: results });
    }

    const text = String(body.text ?? "");
    if (!text.trim()) {
      return NextResponse.json({ translation: text });
    }

    const translation = await googleTranslateText(text, { from, to });
    return NextResponse.json({ translation });
  } catch (err) {
    console.error("[api/translate]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Traduction impossible",
      },
      { status: 500 }
    );
  }
}
