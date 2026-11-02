import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Wrench } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { Button } from "./ui/Button";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  image: string;
  duration: string;
  price: number;
  theory: boolean;
  practice: boolean;
};

type Props = {
  formation: CourseCardData;
  showPrice?: boolean;
};

export function CourseCard({ formation, showPrice = false }: Props) {
  const src = formation.image || "";
  const isRemote = src.startsWith("http");
  const isFirebase = src.includes("firebasestorage");

  return (
    <article className="group flex flex-col overflow-hidden rounded-[14px] bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-brand-100">
        {src ? (
          isRemote ? (
            <Image
              src={src}
              alt={formation.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={isFirebase}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={formation.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-700">
            Pas d&apos;image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-base font-bold text-brand-950">{formation.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-700/80">
          {formation.theory && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Théorie
            </span>
          )}
          {formation.practice && (
            <span className="inline-flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" /> Pratique
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {formation.duration}
          </span>
        </div>
        {showPrice && formation.price > 0 && (
          <p className="text-lg font-bold text-brand-700">
            {formatPrice(formation.price)}
          </p>
        )}
        <div className="mt-auto pt-1">
          <Button
            href={`/formations/${formation.slug}`}
            variant="primary"
            className="w-full"
          >
            {showPrice ? "Voir la formation" : "En savoir plus"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CourseCardLink({ formation }: { formation: CourseCardData }) {
  return (
    <Link
      href={`/formations/${formation.slug}`}
      className="block rounded-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <CourseCard formation={formation} />
    </Link>
  );
}
