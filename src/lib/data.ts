export type Formation = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  theory: boolean;
  practice: boolean;
  image: string;
  description: string;
  modules: { id: string; title: string; duration: string; completed?: boolean }[];
};

export const categories = [
  "Toutes",
  "Chariots élévateurs",
  "Manitous",
  "Excavatrices",
  "Nacelles",
  "Grues",
] as const;

export const formations: Formation[] = [
  {
    id: "1",
    slug: "chariot-elevateur",
    title: "Conduite de chariot élévateur",
    category: "Chariots élévateurs",
    duration: "5 jours",
    price: 2500,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    description:
      "Formation complète à la conduite de chariot élévateur : sécurité, manutention et gestes professionnels.",
    modules: [
      { id: "m1", title: "Module 1 — Sécurité & réglementation", duration: "2h", completed: true },
      { id: "m2", title: "Module 2 — Conduite & manutention", duration: "3h", completed: true },
      { id: "m3", title: "Module 3 — Pratique sur chantier", duration: "4h", completed: false },
      { id: "m4", title: "Module 4 — Évaluation finale", duration: "1h", completed: false },
    ],
  },
  {
    id: "2",
    slug: "manitou",
    title: "Conduite de Manitou",
    category: "Manitous",
    duration: "4 jours",
    price: 2800,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    description:
      "Maîtrisez le chariot télescopique Manitou pour les chantiers et entrepôts.",
    modules: [
      { id: "m1", title: "Module 1 — Bases & sécurité", duration: "2h", completed: true },
      { id: "m2", title: "Module 2 — Manœuvres avancées", duration: "3h", completed: false },
      { id: "m3", title: "Module 3 — Pratique terrain", duration: "4h", completed: false },
    ],
  },
  {
    id: "3",
    slug: "excavatrice",
    title: "Conduite d'excavatrice",
    category: "Excavatrices",
    duration: "6 jours",
    price: 3200,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    description:
      "Formation pratique à la conduite d'excavatrice pour travaux de terrassement.",
    modules: [
      { id: "m1", title: "Module 1 — Introduction", duration: "2h" },
      { id: "m2", title: "Module 2 — Techniques de creusement", duration: "4h" },
      { id: "m3", title: "Module 3 — Évaluation", duration: "2h" },
    ],
  },
  {
    id: "4",
    slug: "nacelle",
    title: "Conduite de nacelle élévatrice",
    category: "Nacelles",
    duration: "3 jours",
    price: 2200,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    description:
      "Travaillez en hauteur en toute sécurité avec les nacelles élévatrices.",
    modules: [
      { id: "m1", title: "Module 1 — Sécurité en hauteur", duration: "2h" },
      { id: "m2", title: "Module 2 — Pratique nacelle", duration: "3h" },
    ],
  },
  {
    id: "5",
    slug: "grue-mobile",
    title: "Conduite de grue mobile",
    category: "Grues",
    duration: "7 jours",
    price: 4500,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    description:
      "Formation certifiante à la conduite de grue mobile sur chantier.",
    modules: [
      { id: "m1", title: "Module 1 — Réglementation", duration: "3h" },
      { id: "m2", title: "Module 2 — Levage & signalisation", duration: "4h" },
      { id: "m3", title: "Module 3 — Pratique", duration: "5h" },
    ],
  },
  {
    id: "6",
    slug: "chariot-frontal",
    title: "Chariot élévateur frontal",
    category: "Chariots élévateurs",
    duration: "5 jours",
    price: 2600,
    theory: true,
    practice: true,
    image:
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80",
    description:
      "Spécialisation chariot frontal pour la logistique et l'industrie.",
    modules: [
      { id: "m1", title: "Module 1 — Bases", duration: "2h" },
      { id: "m2", title: "Module 2 — Pratique", duration: "4h" },
    ],
  },
];

export function getFormation(slug: string) {
  return formations.find((f) => f.slug === slug);
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("fr-MA")} DH`;
}
