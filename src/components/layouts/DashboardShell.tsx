"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, User } from "lucide-react";
import { ClientGuard } from "@/components/auth/ClientGuard";
import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";
import { useI18n } from "@/i18n/LanguageProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    document.documentElement.classList.add("admin-app");
    return () => {
      document.documentElement.classList.remove("admin-app");
    };
  }, []);

  const mobileNav = [
    { href: "/dashboard", label: t.admin.dashboardShort, icon: LayoutDashboard },
    {
      href: "/dashboard/formations",
      label: t.nav.formations,
      icon: BookOpen,
    },
    { href: "/dashboard/profil", label: t.nav.user, icon: User },
  ];

  return (
    <ClientGuard>
      <div className="admin-shell">
        <aside className="hidden h-full w-64 shrink-0 overflow-hidden md:block">
          <DashboardSidebar variant="student" />
        </aside>
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0">
          <div className="shrink-0 border-b border-brand-100 bg-white px-4 py-3 md:hidden">
            <p className="truncate text-sm font-bold text-brand-950">
              {t.admin.studentSpace}
            </p>
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-brand-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-brand-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2.5 text-center text-[10px] font-semibold leading-tight ${
                  active ? "text-brand-700" : "text-brand-950/45"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ClientGuard>
  );
}
