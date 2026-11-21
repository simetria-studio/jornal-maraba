import type { Metadata } from "next";
import { exigirAdministrador, exigirUsuario } from "@/lib/auth";
import { listarUsuarios } from "@/lib/db";
import { excluirUsuario } from "../../actions";
import { FormNovoUsuario, FormRedefinir, FormTrocarSenha } from "@/components/admin/FormsUsuario";

export const metadata: Metadata = { title: "Usuários" };

export default async function Usuarios() {
  const eu = await exigirUsuario();
  if (eu.papel !== "admin") {
    return (
      <>
        <div className="p-cabeca"><h1>Minha conta</h1></div>
        <section className="p-painel"><header><h2>Alterar senha</h2></header><div className="p-corpo"><FormTrocarSenha /></div></section>
      </>
    );
  }
  await exigirAdministrador();
  const lista = await listarUsuarios();
  const admins = lista.filter((u) => u.papel === "admin").length;
  return (
    <>
      <div className="p-cabeca"><div><h1>Usuários</h1><p>Quem pode entrar no painel.</p></div></div>
      <section className="p-painel">
        <table className="p-tabela">
          <thead><tr><th>Nome</th><th>Usuário</th><th>Papel</th><th>Redefinir senha</th><th><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td className="titulo">{u.nome}{u.id === eu.id && <small>você</small>}</td>
                <td>{u.usuario}</td>
                <td><span className={`p-etiqueta ${u.papel === "admin" ? "pub" : "rasc"}`}>{u.papel === "admin" ? "Administrador" : "Editor"}</span></td>
                <td><FormRedefinir id={u.id} usuario={u.usuario} /></td>
                <td>
                  {u.id !== eu.id && !(u.papel === "admin" && admins <= 1) && (
                    <form action={excluirUsuario}>
                      <input type="hidden" name="id" value={u.id} />
                      <button type="submit" className="p-link perigo" data-confirmar={`Excluir o usuário ${u.usuario}?`}>Excluir</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="p-duas">
        <section className="p-painel"><header><h2>Novo usuário</h2></header><div className="p-corpo"><FormNovoUsuario /></div></section>
        <section className="p-painel"><header><h2>Minha senha</h2></header><div className="p-corpo"><FormTrocarSenha /></div></section>
      </div>
    </>
  );
}
