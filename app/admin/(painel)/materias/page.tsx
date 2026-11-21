import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { listarMaterias } from "@/lib/db";
import { EDITORIAS, editoriaPorSlug } from "@/lib/data";
import { alternarPublicacao, excluirMateria } from "../../actions";

export const metadata: Metadata = { title: "Matérias" };

const AVISOS: Record<string, string> = {
  publicada: "Matéria publicada.",
  rascunho: "Rascunho salvo.",
  excluida: "Matéria excluída.",
};
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const data = (s: string) => new Date(s + "Z").toLocaleDateString("pt-BR", { timeZone: "America/Belem" });

export default async function Materias({ searchParams }: { searchParams: Promise<{ q?: string; editoria?: string; situacao?: string; ok?: string }> }) {
  await exigirUsuario();
  const { q = "", editoria = "", situacao = "", ok = "" } = await searchParams;
  let lista = await listarMaterias({ todas: true, editoria: editoria || undefined });
  if (situacao === "publicada") lista = lista.filter((m) => m.publicado);
  if (situacao === "rascunho") lista = lista.filter((m) => !m.publicado);
  if (q.trim()) lista = lista.filter((m) => norm(m.titulo).includes(norm(q.trim())));
  const filtrando = !!(q || editoria || situacao);

  return (
    <>
      <div className="p-cabeca">
        <h1>Matérias</h1>
        <Link href="/admin/materias/nova" className="p-btn">Nova matéria</Link>
      </div>
      {AVISOS[ok] && <p className="p-aviso ok" role="status">{AVISOS[ok]}</p>}

      <section className="p-painel">
        <form className="p-filtros" method="get" role="search" aria-label="Filtrar matérias">
          <label className="p-campo busca"><span>Buscar pelo título</span><input name="q" defaultValue={q} /></label>
          <label className="p-campo"><span>Editoria</span>
            <select name="editoria" defaultValue={editoria}>
              <option value="">Todas</option>
              {EDITORIAS.filter((e) => e.slug !== "colunistas").map((e) => <option key={e.slug} value={e.slug}>{e.nome}</option>)}
            </select>
          </label>
          <label className="p-campo"><span>Situação</span>
            <select name="situacao" defaultValue={situacao}>
              <option value="">Todas</option><option value="publicada">Publicadas</option><option value="rascunho">Rascunhos</option>
            </select>
          </label>
          <button type="submit" className="p-btn sec">Filtrar</button>
          {filtrando && <Link href="/admin/materias">Limpar</Link>}
        </form>

        {lista.length ? (
          <table className="p-tabela">
            <thead><tr><th>Título</th><th>Editoria</th><th>Situação</th><th>Data</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {lista.map((m) => (
                <tr key={m.id}>
                  <td className="titulo">
                    <Link href={`/admin/materias/${m.id}`}>{m.titulo}</Link>
                    {m.autor && <small>{m.autor}</small>}
                  </td>
                  <td>{editoriaPorSlug(m.editoria)?.nome ?? m.editoria}</td>
                  <td><span className={`p-etiqueta ${m.publicado ? "pub" : "rasc"}`}>{m.publicado ? "Publicada" : "Rascunho"}</span></td>
                  <td>{data(m.criado_em)}</td>
                  <td>
                    <div className="acoes">
                      <Link href={`/admin/materias/${m.id}`}>Editar</Link>
                      {m.publicado ? <a href={`/noticia/${m.slug}`} target="_blank" rel="noopener">Ver no site</a> : null}
                      <form action={alternarPublicacao}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className="p-link">{m.publicado ? "Despublicar" : "Publicar"}</button>
                      </form>
                      <form action={excluirMateria}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className="p-link perigo" data-confirmar={`Excluir “${m.titulo}”? Não dá para desfazer.`}>Excluir</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-vazio">
            <p>{filtrando ? "Nenhuma matéria com esses filtros." : "Nenhuma matéria ainda."}</p>
            {!filtrando && <Link href="/admin/materias/nova" className="p-btn">Escrever a primeira</Link>}
          </div>
        )}
      </section>
    </>
  );
}
