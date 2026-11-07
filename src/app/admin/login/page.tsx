"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getRememberedAdminEmail,
  isAdminEmail,
  isAdminRememberChecked,
  saveRememberedAdminEmail,
} from "@/lib/firebase";
import { friendlyAuthError } from "@/lib/authErrors";
import { useI18n } from "@/i18n/LanguageProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function AdminLoginPage() {
  const { login, configured, loading, user, isAdmin, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = getRememberedAdminEmail();
    const checked = isAdminRememberChecked();
    if (saved) setEmail(saved);
    setRemember(checked || Boolean(saved));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, user, isAdmin, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (!isAdminEmail(email.trim())) {
        throw new Error(t.admin.loginNotAllowed);
      }
      saveRememberedAdminEmail(email.trim(), remember);
      const profile = await login(email.trim(), password);
      if (profile.role !== "admin" && !isAdminEmail(profile.email)) {
        await logout();
        throw new Error(t.admin.loginNotAdmin);
      }
      router.replace("/admin");
    } catch (err) {
      setError(friendlyAuthError(err, t.admin.loginFailed));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-md rounded-[14px] bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo variant="header" href={null} />
          <h1 className="text-xl font-extrabold text-brand-950">
            {t.admin.loginAdminTitle}
          </h1>
          <p className="text-center text-sm text-brand-950/60">
            {t.admin.loginAdminSubtitle}
          </p>
          <LocaleSwitcher variant="light" />
        </div>

        {!configured && (
          <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {t.admin.loginFirebaseHint}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              {t.admin.loginEmail}
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!ready}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              {t.admin.loginPassword}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-950/80">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-brand-700"
            />
            {t.admin.loginRemember}
          </label>

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
            {pending ? t.admin.loginSubmitting : t.admin.loginSubmit}
          </Button>

          <p className="text-center text-xs text-brand-950/45">
            <Link href="/connexion" className="font-semibold text-brand-700">
              {t.admin.loginGeneral}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
