"use client";

import { ClientGuard } from "@/components/auth/ClientGuard";
import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ClientGuard>
      <div className="fixed inset-0 z-0 flex overflow-hidden bg-brand-50">
        <div className="hidden h-full w-64 shrink-0 md:block">
          <DashboardSidebar variant="student" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-brand-100 bg-white px-4 py-3 md:hidden">
            <p className="text-sm font-bold text-brand-950">Espace étudiant</p>
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ClientGuard>
  );
}
