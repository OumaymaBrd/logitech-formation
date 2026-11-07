"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
