import Image from "next/image";
import { CalendarDays, Newspaper } from "lucide-react";
import Link from "next/link";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Actualités" };

const news = [
  {
    date: "15 oct 2026",
    tag: "Session",
    title: "Nouvelle session chariot élévateur en novembre",
    excerpt:
      "Inscriptions ouvertes pour la session du 3 au 7 novembre. Places limitées.",
    // Entrepôt / chariot élévateur
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  },
  {
    date: "2 oct 2026",
    tag: "Plateforme",
    title: "Lancement de la plateforme e-learning",
    excerpt:
      "Accédez à vos modules, tests et attestations depuis votre espace stagiaire.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=80",
  },
  {
    date: "18 sep 2026",
    tag: "Entreprises",
    title: "Partenariat entreprises — formations intra",
    excerpt:
      "Formez vos équipes sur site avec nos programmes sur mesure.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80",
  },
];

export default function ActualitesPage() {
  const [featured, ...others] = news;

  return (
    <PublicShell>
      <section className="bg-brand-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Newspaper className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Actualités</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Suivez les nouveautés, sessions et annonces de Logitech Formation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-12 sm:px-6">
        {/* Article principal — photo + texte côte à côte */}
        <article className="grid overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft md:grid-cols-2">
          <div className="relative min-h-[220px] sm:min-h-[280px]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                <CalendarDays className="h-3.5 w-3.5" />
                {featured.date}
              </span>
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                {featured.tag}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold leading-snug text-brand-950">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-950/65 sm:text-base">
              {featured.excerpt}
            </p>
            <Link
              href="/inscription"
              className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline"
            >
              En savoir plus →
            </Link>
          </div>
        </article>

        {/* Autres actualités */}
        <div className="grid gap-5 sm:grid-cols-2">
          {others.map((n) => (
            <article
              key={n.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="relative h-44 w-full bg-brand-100">
                <Image
                  src={n.image}
                  alt={n.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {n.date}
                  </span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                    {n.tag}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-brand-950">
                  {n.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-950/65">
                  {n.excerpt}
                </p>
                <Link
                  href="/connexion"
                  className="mt-4 text-sm font-semibold text-brand-700 hover:underline"
                >
                  En savoir plus →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-brand-950">
              Envie de rejoindre une session ?
            </p>
            <p className="mt-1 text-xs text-brand-950/60">
              Créez un compte stagiaire pour accéder aux formations et à
              l&apos;e-learning.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/inscription" variant="primary">
              S&apos;inscrire
            </Button>
            <Button href="/contact" variant="ghost">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
