"use client";

import { useActionState, useState } from "react";
import { entrar } from "@/app/admin/actions";

export default function FormLogin() {
  const [estado, acao, pendente] = useActionState(entrar, undefined);
  const [ver, setVer] = useState(false);
  return (
    <form action={acao}>
      <label className="p-campo">
        <span>Usuário</span>
        <input name="usuario" required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </label>
      <label className="p-campo">
        <span>Senha</span>
        <span className="senha">
          <input name="senha" type={ver ? "text" : "password"} required autoComplete="current-password" />
          <button type="button" onClick={() => setVer(!ver)} aria-pressed={ver}>{ver ? "Ocultar" : "Mostrar"}</button>
        </span>
      </label>
      {estado?.erro && <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>{estado.erro}</p>}
      <button type="submit" className="p-btn" disabled={pendente}>{pendente ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
