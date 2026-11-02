import { formations } from "@/lib/data";
import { CourseDetailView } from "@/components/CourseDetailView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return formations.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const formation = formations.find((f) => f.slug === slug);
  return {
    title: formation?.title ?? "Formation",
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailView slug={slug} />;
}
