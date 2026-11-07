"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  User,
  Users,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  variant: "student" | "admin";
};

export function DashboardSidebar({ variant }: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useI18n();

  const studentNav = [
    { href: "/dashboard", label: t.admin.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/formations", label: t.nav.formations, icon: BookOpen },
    { href: "/dashboard/profil", label: t.nav.user, icon: User },
  ];

  const adminNav = [
    { href: "/admin", label: t.admin.dashboard, icon: LayoutDashboard },
    { href: "/admin/ajout-cours", label: t.admin.addCourse, icon: PlusCircle },
    { href: "/admin/formations", label: t.admin.formations, icon: BookOpen },
    { href: "/admin/affectation", label: t.admin.assignment, icon: UserCheck },
    { href: "/admin/utilisateurs", label: t.admin.users, icon: Users },
    { href: "/admin/messages", label: t.admin.messages, icon: Mail },
  ];

  const items = variant === "admin" ? adminNav : studentNav;
  const title = variant === "admin" ? t.admin.title : t.admin.studentSpace;

  async function handleLogout() {
    await logout();
    window.location.href = variant === "admin" ? "/admin/login" : "/";
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-brand-950 text-white">
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <Logo variant="sidebar" href="/" />
        <p className="mt-2 px-1 text-[10px] uppercase tracking-wider text-brand-500">
          {title}
        </p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col p-3">
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" &&
                href !== "/admin" &&
                pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-700 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="shrink-0 space-y-0.5 border-t border-white/10 pt-3">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {t.admin.viewSite}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t.admin.logout}
          </button>
        </div>
      </nav>
    </aside>
  );
}
