import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import FormLogin from "@/components/admin/FormLogin";

export const metadata: Metadata = { title: "Entrar" };

export default async function Login() {
  if (await usuarioAtual()) redirect("/admin");
  return (
    <div className="entrada">
      <div className="entrada-marca">
        <div>
          <b>Jornal Marabá</b>
          <p>Painel da redação. Publique matérias, leia as mensagens dos leitores e cuide da equipe.</p>
        </div>
        <small>Acesso restrito à equipe.</small>
      </div>
      <div className="entrada-form">
        <div style={{ width: "min(22rem, 100%)" }}>
          <h1>Entrar</h1>
          <p style={{ margin: "0 0 1.25rem", color: "#5d6862" }}>Use o usuário e a senha que a redação passou para você.</p>
          <FormLogin />
        </div>
      </div>
    </div>
  );
}
