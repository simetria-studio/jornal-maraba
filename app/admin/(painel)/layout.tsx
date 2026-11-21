import { exigirUsuario } from "@/lib/auth";
import { contagens } from "@/lib/db";
import MenuLink from "@/components/admin/MenuLink";
import { sair } from "../actions";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  const { novasMensagens } = await contagens();
  return (
    <div className="painel">
      <aside className="p-menu">
        <div className="p-marca">
          <b>Jornal Marabá</b>
          <span>Painel da redação</span>
        </div>
        <nav className="p-nav" aria-label="Painel">
          <MenuLink href="/admin" exato>Início</MenuLink>
          <MenuLink href="/admin/materias">Matérias</MenuLink>
          <MenuLink href="/admin/mensagens">
            Mensagens
            {novasMensagens > 0 && <span className="contagem" aria-label={`${novasMensagens} novas`}>{novasMensagens}</span>}
          </MenuLink>
          {u.papel === "admin" && <MenuLink href="/admin/usuarios">Usuários</MenuLink>}
          <div className="sep" aria-hidden="true" />
          <a href="/" target="_blank" rel="noopener">Ver o site ↗</a>
        </nav>
        <div className="p-usuario">
          <div>
            <strong>{u.nome}</strong>
            <small>{u.usuario} · {u.papel === "admin" ? "administrador" : "editor"}</small>
          </div>
          <form action={sair}><button type="submit" className="p-btn claro">Sair</button></form>
        </div>
      </aside>
      <main className="p-conteudo" id="conteudo">{children}</main>
    </div>
  );
}
