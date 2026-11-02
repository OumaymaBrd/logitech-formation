"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Logo } from "./Logo";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/", label: "Accueil", auth: false },
  { href: "/formations", label: "Formations", auth: true },
  { href: "/a-propos", label: "À propos", auth: false },
  { href: "/actualites", label: "Actualités", auth: false },
  { href: "/contact", label: "Contact", auth: false },
];

function displayName(opts: {
  firstName?: string;
  lastName?: string;
  email?: string | null;
}) {
  const name = `${opts.firstName || ""} ${opts.lastName || ""}`.trim();
  if (name) return name;
  if (opts.email) return opts.email.split("@")[0];
  return "Utilisateur";
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, isAccepted, loading, logout } = useAuth();

  const canAccessContent = Boolean(user && (isAdmin || isAccepted));
  const isPendingClient = Boolean(user && !isAdmin && !isAccepted);

  const accountHref = !user
    ? "/connexion"
    : isAdmin
      ? "/admin"
      : isAccepted
        ? "/dashboard"
        : "/en-attente";

  const accountLabel = isAdmin
    ? "Espace admin"
    : isAccepted
      ? "Mon espace"
      : "En attente";

  const name = displayName({
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    email: user?.email,
  });
  const roleLabel = isAdmin
    ? "Admin"
    : isPendingClient
      ? "En attente"
      : "Client";

  function resolveHref(href: string, needsAuth: boolean) {
    if (!needsAuth) return href;
    if (loading) return `/connexion?next=${encodeURIComponent(href)}`;
    if (!user) return `/connexion?next=${encodeURIComponent(href)}`;
    // Compte créé mais pas encore accepté → pas d'accès formations / espace
    if (!canAccessContent) return "/en-attente";
    return href;
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  const profileChip = user ? (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href={accountHref}
        className="inline-flex max-w-[220px] items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/80 px-3 py-1.5 transition hover:bg-brand-100"
        title={user.email || name}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
          {(name[0] || "U").toUpperCase()}
        </span>
        <span className="min-w-0 text-left">
          <span className="block truncate text-xs font-semibold text-brand-950">
            {name}
          </span>
          <span className="block text-[10px] font-medium text-brand-700">
            {roleLabel}
          </span>
        </span>
      </Link>
      <Button href={accountHref} variant="secondary" className="shrink-0">
        {accountLabel}
      </Button>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-brand-950/60 hover:bg-brand-50 hover:text-brand-700"
        title="Déconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.75rem] sm:px-6 lg:px-8">
        <Logo variant="header" />

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

        <div className="flex items-center gap-2">
          <span className="hidden rounded-lg border border-brand-100 px-2.5 py-1.5 text-xs font-semibold text-brand-700 md:inline">
            🇫🇷 FR
          </span>
          {!loading && user ? (
            profileChip
          ) : (
            <>
              <Button
                href="/connexion"
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Connexion
              </Button>
              <Button
                href="/inscription"
                variant="primary"
                className="hidden sm:inline-flex"
              >
                Inscription
              </Button>
            </>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-brand-950 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white px-4 py-4 lg:hidden">
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
            {user ? (
              <div className="mt-3 space-y-2 border-t border-brand-100 pt-3">
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
                  <UserRound className="h-4 w-4 text-brand-700" />
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
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Button href="/connexion" variant="ghost" className="mt-2">
                  Connexion
                </Button>
                <Button href="/inscription" variant="primary">
                  Inscription
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
