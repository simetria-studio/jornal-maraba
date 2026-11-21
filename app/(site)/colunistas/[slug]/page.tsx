import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COLUNISTAS } from "@/lib/data";

export function generateStaticParams() {
  return COLUNISTAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: COLUNISTAS.find((c) => c.slug === slug)?.nome ?? "Colunistas" };
}

export default async function Coluna({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COLUNISTAS.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <section className="pagina" style={{ ["--cor" as string]: "#5a56b8" }}>
      <p className="migalha"><Link href="/colunistas">Colunistas</Link> / {c.nome}</p>
      <h1 style={{ color: "#5a56b8", fontFamily: "var(--f-ui)", fontWeight: 500 }}>{c.nome}</h1>
      <span className="sublinha" aria-hidden="true" />
      <p className="vazio" style={{ marginTop: "1.5rem" }}>As matérias de {c.nome} aparecerão aqui.</p>
    </section>
  );
}
