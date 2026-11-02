"use client";

import { ClientGuard } from "@/components/auth/ClientGuard";
import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ClientGuard>
      <div className="flex min-h-screen bg-brand-50">
        <div className="hidden md:flex">
          <DashboardSidebar variant="student" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-brand-100 bg-white px-4 py-3 md:hidden">
            <p className="text-sm font-bold text-brand-950">Espace stagiaire</p>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </ClientGuard>
  );
}
