import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formations } from "@/lib/data";

export default function MesFormationsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-extrabold text-brand-950">
        Mes formations
      </h1>
      <div className="space-y-4">
        {formations.slice(0, 3).map((f, i) => (
          <Link
            key={f.id}
            href={`/formations/${f.slug}`}
            className="block rounded-[14px] bg-white p-5 shadow-soft transition hover:shadow-card"
          >
            <p className="font-semibold text-brand-950">{f.title}</p>
            <ProgressBar
              value={[35, 65, 10][i]}
              showLabel
              className="mt-3"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
