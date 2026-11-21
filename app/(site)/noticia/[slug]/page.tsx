import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { editoriaPorSlug } from "@/lib/data";
import { materiaPorSlug } from "@/lib/db";
import { limparHtml, temHtml } from "@/lib/html";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = await materiaPorSlug(slug);
  return { title: n?.titulo ?? "Matéria", description: n?.chamada.replace(/\*\*/g, "") };
}

export default async function Materia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await materiaPorSlug(slug);
  if (!n) notFound();
  const e = editoriaPorSlug(n.editoria);
  const paragrafos = n.corpo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const rico = temHtml(n.corpo) && limparHtml(n.corpo) !== "";
  return (
    <article className="pagina">
      <p className="migalha"><Link href="/">Home</Link> / <Link href={`/${n.editoria}`} style={{ color: e?.cor }}>{e?.nome}</Link></p>
      <h1>{n.titulo}</h1>
      <p className="vazio-meta">
        {n.autor && <>Por {n.autor} · </>}
        <time dateTime={n.criado_em}>{new Date(n.criado_em + "Z").toLocaleDateString("pt-BR", { timeZone: "America/Belem", day: "numeric", month: "long", year: "numeric" })}</time>
      </p>
      {n.imagem && <Image className="materia-img" src={n.imagem} alt={n.alt} width={380} height={380} style={{ margin: "1rem 0", height: "auto" }} />}
      {rico ? (
        <div className="corpo-materia" dangerouslySetInnerHTML={{ __html: limparHtml(n.corpo) }} />
      ) : paragrafos.length ? (
        paragrafos.map((p, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>)
      ) : (
        <p className="vazio">O texto completo desta matéria ainda não foi publicado.</p>
      )}
    </article>
  );
}
