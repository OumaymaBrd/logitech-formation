import Image from "next/image";
import {
  Award,
  BookOpen,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "À propos" };

const values = [
  {
    icon: Award,
    title: "Formations certifiantes",
    text: "Des parcours reconnus pour valider vos compétences sur engins de chantier.",
  },
  {
    icon: BookOpen,
    title: "Théorie + pratique",
    text: "Apprentissage réglementaire complété par des mises en situation terrain.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & normes",
    text: "Respect des procédures et bonnes pratiques pour travailler en toute sécurité.",
  },
  {
    icon: Users,
    title: "Formateurs experts",
    text: "Une équipe expérimentée pour accompagner chaque stagiaire jusqu’à la certification.",
  },
];

export default function AProposPage() {
  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold text-white">À propos</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Logitech Formation — votre partenaire formation à Tanger.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft lg:grid-cols-2">
          <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"
              alt="Formation professionnelle sur chantier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                Tanger, Maroc
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <Logo variant="header" href={null} className="h-10 w-auto self-start sm:h-11" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Centre de formation
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-950">
                Qui sommes-nous ?
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-brand-950/75">
              Depuis plus de 5 ans, Logitech Formation accompagne les stagiaires
              et les entreprises dans la maîtrise des engins de chantier :
              chariots élévateurs, Manitous, excavatrices, nacelles et grues.
            </p>
            <p className="text-sm leading-relaxed text-brand-950/75">
              Nos formateurs experts allient théorie réglementaire et pratique
              terrain pour garantir des compétences opérationnelles et des
              certifications reconnues.
            </p>
            <p className="text-sm leading-relaxed text-brand-950/75">
              Basés à Tanger, nous proposons des parcours en présentiel et en
              e-learning pour s&apos;adapter à votre rythme.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button href="/formations" variant="primary">
                Voir les formations
              </Button>
              <Button href="/contact" variant="ghost">
                Nous contacter
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-brand-950">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-950/60">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
