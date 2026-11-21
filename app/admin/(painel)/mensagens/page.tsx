import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/auth";
import { listarMensagens } from "@/lib/db";
import { excluirMensagem, marcarMensagem } from "../../actions";

export const metadata: Metadata = { title: "Mensagens" };

export default async function Mensagens() {
  await exigirUsuario();
  const msgs = await listarMensagens();
  const novas = msgs.filter((m) => !m.lida).length;
  return (
    <>
      <div className="p-cabeca">
        <div>
          <h1>Mensagens</h1>
          <p>{novas ? `${novas} ${novas === 1 ? "nova" : "novas"} · ` : ""}{msgs.length} no total, enviadas pelo Fale Conosco.</p>
        </div>
      </div>
      <section className="p-painel">
        {msgs.length ? msgs.map((m) => (
          <article key={m.id} className={`p-msg ${m.lida ? "" : "nova"}`}>
            <h3>{m.assunto}{m.editoria ? ` — ${m.editoria}` : ""}</h3>
            <p className="meta">
              <strong>{m.nome}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a>
              {m.whatsapp && <> · {m.whatsapp}</>}
              {(m.municipio || m.estado) && <> · {[m.municipio, m.estado].filter(Boolean).join("/")}</>}
              {" · "}{new Date(m.criado_em + "Z").toLocaleString("pt-BR", { timeZone: "America/Belem" })}
            </p>
            <p className="texto">{m.mensagem}</p>
            <div className="acoes">
              <form action={marcarMensagem}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="p-link">{m.lida ? "Marcar como não lida" : "Marcar como lida"}</button>
              </form>
              <form action={excluirMensagem}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="p-link perigo" data-confirmar="Excluir esta mensagem? Não dá para desfazer.">Excluir</button>
              </form>
            </div>
          </article>
        )) : <div className="p-vazio"><p>Nenhuma mensagem recebida ainda.</p></div>}
      </section>
    </>
  );
}
