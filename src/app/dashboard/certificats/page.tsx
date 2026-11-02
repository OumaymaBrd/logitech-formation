import { Award } from "lucide-react";

export default function CertificatsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-extrabold text-brand-950">
        Certificats
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {["Chariot élévateur", "Sécurité chantier", "Manitou", "Nacelle", "Premiers secours"].map(
          (title) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-[14px] bg-white p-5 shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-950">{title}</p>
                <p className="text-xs text-brand-950/50">Obtenu en 2026</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
