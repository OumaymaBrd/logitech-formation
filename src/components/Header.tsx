"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Logo } from "./Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/i18n/LanguageProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Locale } from "@/i18n/types";

function displayName(opts: {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  fallback: string;
}) {
  const name = `${opts.firstName || ""} ${opts.lastName || ""}`.trim();
  if (name) return name;
  if (opts.email) return opts.email.split("@")[0];
  return opts.fallback;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, isAccepted, loading, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const links = [
    { href: "/", label: t.nav.home, auth: false },
    { href: "/formations", label: t.nav.formations, auth: true },
    { href: "/a-propos", label: t.nav.about, auth: false },
    { href: "/actualites", label: t.nav.news, auth: false },
    { href: "/contact", label: t.nav.contact, auth: false },
  ];

  const sessionActive = Boolean(user && (isAdmin || isAccepted));
  const canAccessContent = sessionActive;

  const accountHref = isAdmin ? "/admin" : "/dashboard";
  const accountLabel = isAdmin ? t.nav.adminSpace : t.nav.studentSpace;

  const name = displayName({
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    email: user?.email,
    fallback: t.nav.user,
  });
  const roleLabel = isAdmin ? t.nav.admin : t.nav.client;

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function resolveHref(href: string, needsAuth: boolean) {
    if (!needsAuth) return href;
    if (loading || !canAccessContent) {
      return `/connexion?next=${encodeURIComponent(href)}`;
    }
    return href;
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-2 px-3 sm:h-[4.75rem] sm:gap-4 sm:px-6 lg:px-8">
        <div className="min-w-0 max-w-[48%] shrink sm:max-w-none">
          <Logo variant="header" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const href = resolveHref(link.href, link.auth);
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "text-brand-950/75 hover:bg-brand-50 hover:text-brand-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:inline-flex">
            <LocaleSwitcher />
          </div>
          {!loading && sessionActive ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href={accountHref}
                className="inline-flex max-w-[140px] items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/80 px-2.5 py-1.5 transition hover:bg-brand-100 lg:max-w-[200px]"
                title={user?.email || name}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                  {(name[0] || "U").toUpperCase()}
                </span>
                <span className="min-w-0 text-start">
                  <span className="block truncate text-xs font-semibold text-brand-950">
                    {name}
                  </span>
                  <span className="block text-[10px] font-medium text-brand-700">
                    {roleLabel}
                  </span>
                </span>
              </Link>
              <Button
                href={accountHref}
                variant="secondary"
                className="hidden shrink-0 lg:inline-flex"
              >
                {accountLabel}
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-brand-950/60 hover:bg-brand-50 hover:text-brand-700"
                title={t.nav.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Button
                href="/connexion"
                variant="ghost"
                className="hidden px-3 sm:inline-flex"
              >
                {t.nav.login}
              </Button>
              <Button
                href="/inscription"
                variant="primary"
                className="hidden px-3 sm:inline-flex"
              >
                {t.nav.signup}
              </Button>
            </>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-brand-950 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain border-t border-brand-100 bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 flex gap-2 sm:hidden">
            {(["fr", "ar"] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  locale === code
                    ? "bg-brand-700 text-white"
                    : "bg-brand-100 text-brand-700"
                }`}
              >
                {code === "fr" ? t.lang.fr : t.lang.ar}
              </button>
            ))}
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={resolveHref(link.href, link.auth)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-950/90 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            {sessionActive ? (
              <div className="mt-3 space-y-2 border-t border-brand-100 pt-3">
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
                  <UserRound className="h-4 w-4 shrink-0 text-brand-700" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-950">
                      {name}
                    </p>
                    <p className="text-[11px] text-brand-700">{roleLabel}</p>
                  </div>
                </div>
                <Link
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-100 px-5 py-2.5 text-sm font-semibold text-brand-700"
                >
                  {accountLabel}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-brand-100 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2 border-t border-brand-100 pt-3 sm:hidden">
                <Button href="/connexion" variant="ghost" className="w-full">
                  {t.nav.login}
                </Button>
                <Button href="/inscription" variant="primary" className="w-full">
                  {t.nav.signup}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
