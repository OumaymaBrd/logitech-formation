"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/auth/AuthProvider";

type Item = { href: string; label: string; icon: React.ElementType };

const studentNav: Item[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/formations", label: "Mes formations", icon: BookOpen },
  { href: "/dashboard/tests", label: "Mes tests", icon: ClipboardList },
  { href: "/dashboard/documents", label: "Mes documents", icon: FileText },
  { href: "/dashboard/certificats", label: "Certificats", icon: Award },
  { href: "/dashboard/profil", label: "Mon profil", icon: User },
];

const adminNav: Item[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/ajout-cours", label: "Ajout du cours", icon: PlusCircle },
  { href: "/admin/formations", label: "Formations", icon: BookOpen },
  { href: "/admin/affectation", label: "Affectation", icon: UserCheck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
];

type Props = {
  variant: "student" | "admin";
};

export function DashboardSidebar({ variant }: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = variant === "admin" ? adminNav : studentNav;
  const title = variant === "admin" ? "Admin" : "Espace stagiaire";

  async function handleLogout() {
    await logout();
    window.location.href = variant === "admin" ? "/admin/login" : "/";
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-brand-950 text-white">
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <Logo variant="sidebar" />
        <p className="mt-2 px-1 text-[10px] uppercase tracking-wider text-brand-500">
          {title}
        </p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        <div className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
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

        <div className="mt-auto shrink-0 space-y-0.5 border-t border-white/10 pt-3">
          {variant === "admin" && (
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Voir le site
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </nav>
    </aside>
  );
}
