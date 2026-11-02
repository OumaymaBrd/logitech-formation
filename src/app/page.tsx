import Image from "next/image";
import {
  Award,
  BookOpen,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Users,
  Building2,
  Smile,
} from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { Button } from "@/components/ui/Button";
import { BrandBadge } from "@/components/Logo";

const features = [
  { icon: Award, label: "Formations certifiantes" },
  { icon: GraduationCap, label: "Formateurs experts" },
  { icon: BookOpen, label: "Théorie + Pratique" },
  { icon: ShieldCheck, label: "Sécurité & normes" },
];

const stats = [
  { icon: Users, value: "+ 500", label: "Stagiaires formés" },
  { icon: BookOpen, value: "+ 20", label: "Formations" },
  { icon: Building2, value: "+ 5", label: "Années d'expérience" },
  { icon: Smile, value: "100%", label: "Taux de satisfaction" },
];

export default function HomePage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
            alt="Opérateur de chariot élévateur"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-950/40" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 md:py-28 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <BrandBadge className="mb-6" />
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Formez-vous aujourd&apos;hui,{" "}
              <span className="text-brand-500">construisez votre avenir.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Des formations pratiques et théoriques pour maîtriser les engins
              de chantier et accélérer votre carrière.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/formations" variant="primary" className="px-6 py-3">
                Découvrir nos formations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-[14px] bg-white px-5 py-4 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-brand-950">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* E-learning + Présentiel */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid overflow-hidden rounded-[14px] md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 bg-brand-700 p-8 text-white sm:p-10">
            <Laptop className="h-10 w-10 text-brand-100" />
            <h3 className="text-xl font-bold">Formation en ligne</h3>
            <p className="text-sm text-white/80">
              Accédez à vos cours, tests et ressources depuis chez vous via
              notre plateforme e-learning.
            </p>
          </div>
          <div className="relative min-h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80"
              alt="Formation en présentiel"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-950/90 to-transparent p-8 sm:p-10">
              <h3 className="text-xl font-bold text-white">
                Nos formations en présentiel
              </h3>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                Pratique sur engins réels avec nos formateurs experts à Tanger.
              </p>
              <Button href="/formations" variant="primary" className="mt-4 w-fit">
                Réserver une session
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-100 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-brand-950">{value}</p>
                <p className="text-sm text-brand-950/60">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
