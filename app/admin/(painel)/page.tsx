import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { contagens, listarMaterias } from "@/lib/db";
import { editoriaPorSlug } from "@/lib/data";

const data = (s: string) => new Date(s + "Z").toLocaleDateString("pt-BR", { timeZone: "America/Belem" });

export default async function Inicio() {
  const u = await exigirUsuario();
  const c = await contagens();
  const recentes = (await listarMaterias({ todas: true })).slice(0, 6);
  return (
    <>
      <div className="p-cabeca">
        <div>
          <h1>Olá, {u.nome.split(" ")[0]}</h1>
          <p>O que vamos publicar hoje?</p>
        </div>
        <Link href="/admin/materias/nova" className="p-btn">Nova matéria</Link>
      </div>

      <div className="p-numeros">
        <Link href="/admin/materias?situacao=publicada" className="p-numero"><b>{c.publicadas}</b><span>matérias publicadas</span></Link>
        <Link href="/admin/materias?situacao=rascunho" className="p-numero"><b>{c.rascunhos}</b><span>rascunhos</span></Link>
        <Link href="/admin/mensagens" className="p-numero"><b>{c.novasMensagens}</b><span>mensagens novas</span></Link>
      </div>

      <section className="p-painel" aria-labelledby="rec">
        <header>
          <h2 id="rec">Últimas matérias</h2>
          <Link href="/admin/materias">Ver todas</Link>
        </header>
        {recentes.length ? (
          <table className="p-tabela">
            <thead><tr><th>Título</th><th>Editoria</th><th>Situação</th><th>Data</th></tr></thead>
            <tbody>
              {recentes.map((m) => (
                <tr key={m.id}>
                  <td className="titulo"><Link href={`/admin/materias/${m.id}`}>{m.titulo}</Link></td>
                  <td>{editoriaPorSlug(m.editoria)?.nome ?? m.editoria}</td>
                  <td><span className={`p-etiqueta ${m.publicado ? "pub" : "rasc"}`}>{m.publicado ? "Publicada" : "Rascunho"}</span></td>
                  <td>{data(m.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-vazio"><p>Nenhuma matéria ainda.</p><Link href="/admin/materias/nova" className="p-btn">Escrever a primeira</Link></div>
        )}
      </section>
    </>
  );
}
