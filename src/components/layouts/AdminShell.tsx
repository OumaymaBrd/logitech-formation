"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserCheck,
  Users,
} from "lucide-react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";
import { useAuth } from "@/components/auth/AuthProvider";

const mobileNav = [
  { href: "/admin", label: "Tableau", icon: LayoutDashboard },
  { href: "/admin/ajout-cours", label: "Ajout", icon: PlusCircle },
  { href: "/admin/formations", label: "Formations", icon: BookOpen },
  { href: "/admin/affectation", label: "Affect.", icon: UserCheck },
  { href: "/admin/utilisateurs", label: "Users", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-brand-50">
        <div className="hidden shrink-0 md:block">
          <DashboardSidebar variant="admin" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand-100 bg-white px-4 py-3 md:hidden">
            <p className="text-sm font-bold text-brand-950">Administration</p>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Site
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.href = "/admin/login";
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Déconnexion
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>

        {/* Menu bas mobile — 4 items + déconnexion déjà en header */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-100 bg-white md:hidden">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                  active ? "text-brand-700" : "text-brand-950/45"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </AdminGuard>
  );
}
