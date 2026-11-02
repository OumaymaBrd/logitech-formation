import { Mail, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">Contact</h1>
          <p className="mt-2 text-sm text-white/70">
            Une question ? Contactez notre équipe.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Téléphone", value: "+212 5XX-XXXXXX" },
            {
              icon: Mail,
              label: "Email",
              value: "contact@logitech-formation.ma",
            },
            {
              icon: MapPin,
              label: "Adresse",
              value: "Zone industrielle, Tanger, Maroc",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-[14px] bg-white p-5 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-brand-700">{label}</p>
                <p className="text-sm font-medium text-brand-950">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <form className="space-y-4 rounded-[14px] bg-white p-6 shadow-card">
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Nom complet
            </label>
            <input
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="vous@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Votre message…"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Envoyer
          </Button>
        </form>
      </section>
    </PublicShell>
  );
}
