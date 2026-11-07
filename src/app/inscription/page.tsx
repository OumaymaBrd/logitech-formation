"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { notifyClientEmail } from "@/lib/notify";
import { friendlyAuthError } from "@/lib/authErrors";
import { useI18n } from "@/i18n/LanguageProvider";

export default function InscriptionPage() {
  const {
    registerClient,
    logout,
    configured,
    user,
    loading,
    isAdmin,
    isAccepted,
  } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (isAdmin) {
      router.replace("/admin");
      return;
    }
    if (isAccepted) {
      router.replace("/dashboard");
    }
  }, [loading, user, isAdmin, isAccepted, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (password.length < 6) {
        throw new Error(t.auth.passwordShort);
      }
      const mail = email.trim();
      await registerClient({
        firstName,
        lastName,
        email: mail,
        phone,
        password,
        formationSlug: "",
      });
      void notifyClientEmail({
        type: "welcome",
        to: mail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await logout();
      router.replace(`/en-attente?email=${encodeURIComponent(mail)}`);
    } catch (err) {
      setError(friendlyAuthError(err, t.auth.signupFailed));
    } finally {
      setPending(false);
    }
  }

  if (loading || (user && (isAdmin || isAccepted))) {
    return (
      <PublicShell>
        <p className="py-16 text-center text-sm text-brand-950/50">
          {t.auth.redirecting}
        </p>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">
            {t.auth.signupTitle}
          </h1>
          <p className="mt-2 text-sm text-white/70">{t.auth.signupSubtitle}</p>
        </div>
      </section>
      <section className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-[14px] bg-white p-6 shadow-card"
        >
          {!configured && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {t.auth.firebaseMissingFull}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">
                {t.auth.firstName} *
              </label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">
                {t.auth.lastName} *
              </label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              {t.auth.email} *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              {t.auth.phone}
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t.auth.phonePlaceholder}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">
              {t.auth.password} *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={pending || !configured}
          >
            {pending ? t.auth.submittingSignup : t.auth.submitSignup}
          </Button>
          <p className="text-center text-xs text-brand-950/50">
            {t.auth.hasAccount}{" "}
            <Link href="/connexion" className="font-semibold text-brand-700">
              {t.auth.loginLink}
            </Link>
          </p>
        </form>
      </section>
    </PublicShell>
  );
}
