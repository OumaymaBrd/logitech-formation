/**
 * Traduction FR → AR via l'endpoint public Google Translate (gtx).
 * Utilisé pour le contenu dynamique saisi en français (cours, etc.).
 */

const cache = new Map<string, string>();

function cacheKey(text: string, to: string, from: string) {
  return `${from}|${to}|${text}`;
}

export async function googleTranslateText(
  text: string,
  opts: { from?: string; to?: string } = {}
): Promise<string> {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return text;

  const from = opts.from || "fr";
  const to = opts.to || "ar";
  if (from === to) return text;

  const key = cacheKey(trimmed, to, from);
  const hit = cache.get(key);
  if (hit) return hit;

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(from) +
    "&tl=" +
    encodeURIComponent(to) +
    "&dt=t&q=" +
    encodeURIComponent(trimmed);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Traduction Google impossible (${res.status})`);
  }

  const data = (await res.json()) as unknown;
  // Structure: [[["traduction","source",...], ...], ...]
  let translated = "";
  if (Array.isArray(data) && Array.isArray(data[0])) {
    translated = (data[0] as unknown[])
      .map((part) => (Array.isArray(part) ? String(part[0] ?? "") : ""))
      .join("");
  }

  if (!translated) translated = text;
  cache.set(key, translated);
  return translated;
}

export async function googleTranslateMany(
  texts: string[],
  opts: { from?: string; to?: string } = {}
): Promise<string[]> {
  const out: string[] = [];
  for (const t of texts) {
    out.push(await googleTranslateText(t, opts));
  }
  return out;
}
