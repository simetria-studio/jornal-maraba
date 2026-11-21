import type { Metadata } from "next";
import Link from "next/link";
import { COLUNISTAS, EDITORIAS } from "@/lib/data";
import { listarMaterias } from "@/lib/db";
import { textoPuro } from "@/lib/html";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Busca" };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const termo = norm(q.trim());
  const materias = termo ? (await listarMaterias()).filter((n) => norm(n.titulo + " " + n.chamada + " " + textoPuro(n.corpo)).includes(termo)) : [];
  const secoes = termo
    ? [
        ...EDITORIAS.filter((e) => norm(e.nome).includes(termo)).map((e) => ({ href: `/${e.slug}`, nome: e.nome })),
        ...COLUNISTAS.filter((c) => norm(c.nome).includes(termo)).map((c) => ({ href: `/colunistas/${c.slug}`, nome: c.nome })),
      ]
    : [];
  return (
    <section className="pagina">
      <h1>Busca</h1>
      <span className="sublinha" aria-hidden="true" />
      <p style={{ marginTop: "1rem" }}>{q ? <>Resultados para <strong>{q}</strong></> : "Digite um termo no campo de busca do topo da página."}</p>
      {q && !materias.length && !secoes.length && <p className="vazio">Nada encontrado. Tente outra palavra ou procure por editoria no menu.</p>}
      <ul className="lista-links">
        {secoes.map((s) => <li key={s.href}><Link href={s.href}>{s.nome}</Link></li>)}
        {materias.map((n) => <li key={n.slug}><Link href={`/noticia/${n.slug}`}>{n.titulo}</Link></li>)}
      </ul>
    </section>
  );
}
