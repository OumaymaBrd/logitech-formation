"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  PlusCircle,
  UserCheck,
  Users,
} from "lucide-react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/i18n/LanguageProvider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useI18n();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    document.documentElement.classList.add("admin-app");
    return () => {
      document.documentElement.classList.remove("admin-app");
    };
  }, [isLogin]);

  const mobileNav = [
    { href: "/admin", label: t.admin.dashboardShort, icon: LayoutDashboard },
    {
      href: "/admin/ajout-cours",
      label: t.admin.addCourseShort,
      icon: PlusCircle,
    },
    { href: "/admin/formations", label: t.admin.formations, icon: BookOpen },
    {
      href: "/admin/affectation",
      label: t.admin.assignmentShort,
      icon: UserCheck,
    },
    { href: "/admin/utilisateurs", label: t.admin.usersShort, icon: Users },
    { href: "/admin/messages", label: t.admin.messagesShort, icon: Mail },
  ];

  if (isLogin) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return (
    <AdminGuard>
      <div className="admin-shell">
        <aside className="hidden h-full w-64 shrink-0 overflow-hidden md:block">
          <DashboardSidebar variant="admin" />
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-white px-3 py-2.5 sm:px-4 md:hidden">
            <p className="min-w-0 truncate text-sm font-bold text-brand-950">
              {t.admin.administration}
            </p>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <LocaleSwitcher variant="light" />
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                title={t.admin.site}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">{t.admin.site}</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.href = "/admin/login";
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                title={t.admin.logout}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative z-10 hidden shrink-0 items-center justify-end gap-3 border-b border-brand-100 bg-white px-6 py-2.5 md:flex">
            <span className="text-xs font-medium text-brand-950/45">
              {t.admin.language}
            </span>
            <LocaleSwitcher variant="light" />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-brand-50 p-3 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-brand-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-center text-[9px] font-semibold leading-tight sm:text-[10px] ${
                  active ? "text-brand-700" : "text-brand-950/45"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2 max-w-full">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AdminGuard>
  );
}
