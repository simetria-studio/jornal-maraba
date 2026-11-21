import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { usuarioPorId, type Usuario } from "./db";

const COOKIE = "jm_sessao";
const DURACAO = 60 * 60 * 12; // 12 horas

function segredo() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("Defina AUTH_SECRET (16+ caracteres) no .env");
    return "dev-secret-nao-use-em-producao";
  }
  return s;
}

const assinar = (v: string) => crypto.createHmac("sha256", segredo()).update(v).digest("hex");

function igual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export async function abrirSessao(usuarioId: number) {
  const exp = Math.floor(Date.now() / 1000) + DURACAO;
  const base = `${usuarioId}.${exp}`;
  (await cookies()).set(COOKIE, `${base}.${assinar(base)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

/** Usuário da sessão atual (ou null). Confere no banco a cada requisição, então excluir um usuário derruba o acesso dele. */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [id, exp, sig] = v.split(".");
  if (!id || !exp || !sig || !igual(sig, assinar(`${id}.${exp}`))) return null;
  if (Number(exp) <= Date.now() / 1000) return null;
  return (await usuarioPorId(Number(id))) ?? null;
});

export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect("/admin/login");
  return u;
}

export async function exigirAdministrador(): Promise<Usuario> {
  const u = await exigirUsuario();
  if (u.papel !== "admin") redirect("/admin");
  return u;
}
