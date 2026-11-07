"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminEmail } from "@/lib/firebase";
import { friendlyAuthError } from "@/lib/authErrors";
import { useI18n } from "@/i18n/LanguageProvider";

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function ConnexionForm() {
  const { login, logout, configured, user, loading, isAdmin, isAccepted } =
    useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
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
      const dest =
        nextPath && !nextPath.startsWith("/admin") ? nextPath : "/dashboard";
      router.replace(dest);
    }
  }, [loading, user, isAdmin, isAccepted, nextPath, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const mail = email.trim();
      const profile = await login(mail, password);
      const admin =
        profile.role === "admin" || isAdminEmail(profile.email);

      if (admin) {
        router.replace("/admin");
        return;
      }

      if (profile.status === "accepted") {
        const dest =
          nextPath && !nextPath.startsWith("/admin")
            ? nextPath
            : "/dashboard";
        router.replace(dest);
        return;
      }

      await logout();
      if (profile.status === "refused") {
        router.replace(
          `/en-attente?status=refused&email=${encodeURIComponent(mail)}`
        );
      } else {
        router.replace(`/en-attente?email=${encodeURIComponent(mail)}`);
      }
    } catch (err) {
      setError(friendlyAuthError(err, t.auth.loginFailed));
    } finally {
      setPending(false);
    }
  }

  if (loading || (user && (isAdmin || isAccepted))) {
    return (
      <p className="rounded-[14px] bg-white p-6 text-center text-sm text-brand-950/50 shadow-card">
        {t.auth.redirecting}
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[14px] bg-white p-6 shadow-card"
    >
      {!configured && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t.auth.firebaseMissing}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-semibold">
          {t.auth.email}
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
          {t.auth.password}
        </label>
        <input
          type="password"
          required
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
        {pending ? t.auth.submittingLogin : t.auth.submitLogin}
      </Button>
      <p className="text-center text-xs text-brand-950/50">
        {t.auth.noAccount}{" "}
        <Link href="/inscription" className="font-semibold text-brand-700">
          {t.auth.signupLink}
        </Link>
      </p>
    </form>
  );
}

export default function ConnexionPage() {
  const { t } = useI18n();

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">
            {t.auth.loginTitle}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <p className="text-center text-sm text-brand-950/50">
              {t.auth.loading}
            </p>
          }
        >
          <ConnexionForm />
        </Suspense>
      </section>
    </PublicShell>
  );
}
