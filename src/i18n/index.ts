import { ar } from "./messages/ar";
import { fr, type Messages } from "./messages/fr";
import type { Locale } from "./types";

export type { Locale, Messages };
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
} from "./types";

const catalog: Record<Locale, Messages> = { fr, ar };

export function getMessages(locale: Locale): Messages {
  return catalog[locale] ?? fr;
}
