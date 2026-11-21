import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Chamada from "@/components/Chamada";
import { COLUNISTAS, EDITORIAS, editoriaPorSlug } from "@/lib/data";
import { listarMaterias } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ editoria: string }> }): Promise<Metadata> {
  const { editoria } = await params;
  return { title: editoriaPorSlug(editoria)?.nome ?? "Editoria" };
}

export default async function Editoria({ params }: { params: Promise<{ editoria: string }> }) {
  const { editoria } = await params;
  const e = editoriaPorSlug(editoria);
  if (!e) notFound();
  const materias = await listarMaterias({ editoria: e.slug });

  return (
    <section className="pagina" style={{ ["--cor" as string]: e.cor, maxWidth: "52rem" }}>
      <h1 style={{ color: e.cor, fontFamily: "var(--f-ui)", fontWeight: 500 }}>{e.nome}</h1>
      <span className="sublinha" aria-hidden="true" />

      {e.slug === "colunistas" ? (
        <ul className="lista-links">
          {COLUNISTAS.map((c) => <li key={c.slug}><Link href={`/colunistas/${c.slug}`}>{c.nome}</Link></li>)}
        </ul>
      ) : materias.length ? (
        <div className="editoria-bloco">
          {materias.map((n) => (
            <Link key={n.slug} href={`/noticia/${n.slug}`} className="materia">
              {n.imagem && <Image src={n.imagem} alt={n.alt} width={190} height={190} />}
              <p><Chamada texto={n.chamada} /></p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="vazio" style={{ marginTop: "1.5rem" }}>Ainda não há matérias em {e.nome}. Volte em breve ou envie uma sugestão de pauta pelo <Link href="/fale-conosco">Fale Conosco</Link>.</p>
      )}
    </section>
  );
}
