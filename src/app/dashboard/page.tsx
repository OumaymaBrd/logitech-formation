import Link from "next/link";
import { Award, BookOpen, TrendingUp } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { formations } from "@/lib/data";

const activeCourses = [
  { formation: formations[0], progress: 35 },
  { formation: formations[1], progress: 65 },
];

const upcoming = [
  { title: "Pratique chariot élévateur", date: "Lun 27 oct", time: "09:00" },
  { title: "Sécurité Manitou — QCM", date: "Mer 29 oct", time: "14:30" },
  { title: "Évaluation finale", date: "Ven 31 oct", time: "10:00" },
];

export default function StudentDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">
          Bonjour Ahmed 👋
        </h1>
        <p className="mt-1 text-sm text-brand-950/60">
          Voici un aperçu de votre progression.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: BookOpen,
            value: "2",
            label: "Formations en cours",
            color: "bg-brand-100 text-brand-700",
          },
          {
            icon: TrendingUp,
            value: "65%",
            label: "Progression moyenne",
            color: "bg-brand-100 text-brand-700",
          },
          {
            icon: Award,
            value: "5",
            label: "Certificats obtenus",
            color: "bg-brand-100 text-brand-700",
          },
        ].map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-[14px] bg-white p-5 shadow-soft"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-brand-950">{value}</p>
              <p className="text-xs text-brand-950/50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-[14px] bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-950">Mes formations</h2>
        <ul className="space-y-4">
          {activeCourses.map(({ formation, progress }) => (
            <li
              key={formation.id}
              className="flex flex-col gap-3 rounded-xl border border-brand-100 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-950">{formation.title}</p>
                <ProgressBar value={progress} className="mt-2" showLabel />
              </div>
              <Button href={`/formations/${formation.slug}`} variant="primary">
                Continuer
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[14px] bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-950">Prochains cours</h2>
        <ul className="divide-y divide-brand-100">
          {upcoming.map((item) => (
            <li
              key={item.title}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-medium text-brand-950">{item.title}</p>
                <p className="text-xs text-brand-950/50">
                  {item.date} · {item.time}
                </p>
              </div>
              <Link
                href="/formations/chariot-elevateur"
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-500/20"
              >
                Voir
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
