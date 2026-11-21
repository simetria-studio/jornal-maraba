"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarUsuario, redefinirSenha, trocarSenha } from "@/app/admin/actions";

function Aviso({ e }: { e?: { erro?: string; ok?: string } }) {
  if (e?.erro) return <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>{e.erro}</p>;
  if (e?.ok) return <p role="status" className="p-aviso ok" style={{ margin: 0 }}>{e.ok}</p>;
  return null;
}

export function FormNovoUsuario() {
  const [e, acao, pend] = useActionState(criarUsuario, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (e?.ok) ref.current?.reset(); }, [e]);
  return (
    <form action={acao} ref={ref} className="p-form" autoComplete="off">
      <Aviso e={e} />
      <label className="p-campo"><span>Nome</span><input name="nome" required maxLength={80} /></label>
      <label className="p-campo"><span>Usuário (login)</span><input name="usuario" required minLength={3} maxLength={30} autoCapitalize="none" spellCheck={false} /></label>
      <label className="p-campo"><span>Senha</span><small>Mínimo de 8 caracteres.</small><input name="senha" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label className="p-campo"><span>Papel</span>
        <select name="papel" defaultValue="editor">
          <option value="editor">Editor — escreve e publica matérias</option>
          <option value="admin">Administrador — também gerencia usuários</option>
        </select>
      </label>
      <button type="submit" className="p-btn" disabled={pend}>{pend ? "Criando…" : "Criar usuário"}</button>
    </form>
  );
}

export function FormTrocarSenha() {
  const [e, acao, pend] = useActionState(trocarSenha, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (e?.ok) ref.current?.reset(); }, [e]);
  return (
    <form action={acao} ref={ref} className="p-form">
      <Aviso e={e} />
      <label className="p-campo"><span>Senha atual</span><input name="atual" type="password" required autoComplete="current-password" /></label>
      <label className="p-campo"><span>Nova senha</span><small>Mínimo de 8 caracteres.</small><input name="nova" type="password" required minLength={8} autoComplete="new-password" /></label>
      <button type="submit" className="p-btn" disabled={pend}>{pend ? "Salvando…" : "Alterar minha senha"}</button>
    </form>
  );
}

export function FormRedefinir({ id, usuario }: { id: number; usuario: string }) {
  const [e, acao, pend] = useActionState(redefinirSenha, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (e?.ok) ref.current?.reset(); }, [e]);
  return (
    <form action={acao} ref={ref} className="p-linha-form">
      <input type="hidden" name="id" value={id} />
      <input name="nova" type="password" minLength={8} required placeholder="Nova senha" aria-label={`Nova senha para ${usuario}`} autoComplete="new-password" />
      <button type="submit" className="p-btn sec" disabled={pend}>Redefinir</button>
      {e?.erro && <span role="alert" style={{ color: "#b3261e", flexBasis: "100%" }}>{e.erro}</span>}
      {e?.ok && <span role="status" style={{ flexBasis: "100%" }}>{e.ok}</span>}
    </form>
  );
}
