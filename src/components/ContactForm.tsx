"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createContactMessage } from "@/lib/messages";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useI18n } from "@/i18n/LanguageProvider";

export function ContactForm() {
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error(t.contact.firebaseMissing);
      }
      await createContactMessage({ fullName, email, phone, message });
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSuccess(t.contact.success);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.contact.errorGeneric
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[14px] bg-white p-6 shadow-card"
    >
      <div>
        <label className="mb-1 block text-xs font-semibold text-brand-950">
          {t.contact.fullName} *
        </label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={t.contact.namePlaceholder}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-brand-950">
          {t.contact.email} *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={t.contact.emailPlaceholder}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-brand-950">
          {t.contact.phoneField} *
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={t.contact.phonePlaceholder}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-brand-950">
          {t.contact.message} *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={t.contact.messagePlaceholder}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={pending}
      >
        {pending ? t.contact.sending : t.contact.send}
      </Button>
    </form>
  );
}
