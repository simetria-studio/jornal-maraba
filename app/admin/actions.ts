"use server";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { abrirSessao, encerrarSessao, exigirAdministrador, exigirUsuario } from "@/lib/auth";
import { AGORA_SQL, UPLOAD_DIR, sql, materiaPorId, slugLivre, slugify, usuarioPorId, usuarioPorLogin } from "@/lib/db";
import { confereSenha, hashSenha } from "@/lib/senha";
import { EDITORIAS } from "@/lib/data";
import { limparHtml } from "@/lib/html";
import { MAX_GALERIA, lerGaleria, type FotoGaleria } from "@/lib/galeria";
import { embedDeVideo } from "@/lib/video";

export type Estado = { erro?: string; ok?: string } | undefined;

/* ---------- Sessão ---------- */

const tentativas = new Map<string, { n: number; ate: number }>();

export async function entrar(_: Estado, fd: FormData): Promise<Estado> {
  const login = String(fd.get("usuario") ?? "").trim().toLowerCase();
  const senha = String(fd.get("senha") ?? "");
  const agora = Date.now();
  const t = tentativas.get(login);
  if (t && t.n >= 5 && t.ate > agora) return { erro: "Muitas tentativas. Aguarde 5 minutos e tente de novo." };

  const u = login ? await usuarioPorLogin(login) : undefined;
  // Confere a senha mesmo sem usuário, para o tempo de resposta não revelar quais logins existem.
  const ok = confereSenha(senha, u?.senha_hash ?? "00:00") && !!u;
  if (!ok || !u) {
    tentativas.set(login, { n: (t && t.ate > agora ? t.n : 0) + 1, ate: agora + 5 * 60_000 });
    return { erro: "Usuário ou senha incorretos." };
  }
  tentativas.delete(login);
  await abrirSessao(u.id);
  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}

/* ---------- Matérias ---------- */

const TIPOS: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

async function salvarImagem(f: FormDataEntryValue | null): Promise<string | null | "invalida"> {
  if (!(f instanceof File) || f.size === 0) return null;
  const ext = TIPOS[f.type];
  if (!ext || f.size > 8 * 1024 * 1024) return "invalida";
  const nome = `${crypto.randomUUID()}${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, nome), Buffer.from(await f.arrayBuffer()));
  return `/uploads/${nome}`;
}

export async function salvarMateria(_: Estado, fd: FormData): Promise<Estado> {
  const quem = await exigirUsuario();
  const id = Number(fd.get("id") || 0);
  const s = (k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
  const titulo = s("titulo", 250);
  const editoria = s("editoria", 40);
  if (!titulo) return { erro: "Informe o título." };
  if (!EDITORIAS.some((e) => e.slug === editoria)) return { erro: "Escolha uma editoria." };

  const atual = id ? await materiaPorId(id) : undefined;
  if (id && !atual) return { erro: "Matéria não encontrada." };

  const nova = fd.get("remover_imagem") ? null : await salvarImagem(fd.get("imagem"));
  if (nova === "invalida") return { erro: "Imagem inválida. Use JPG, PNG, WEBP ou GIF de até 8 MB." };
  const imagem = fd.get("remover_imagem") ? "" : (nova ?? atual?.imagem ?? "");

  // Galeria: fotos já salvas (na ordem escolhida) + fotos novas enviadas agora.
  const SRC_OK = /^\/(uploads\/[a-f0-9-]{36}\.(jpg|png|webp|gif)|img\/[\w.-]+)$/;
  const galeria: FotoGaleria[] = lerGaleria(String(fd.get("galeria_atual") ?? "[]"))
    .filter((f) => SRC_OK.test(f.src))
    .map((f) => ({ src: f.src, alt: f.alt.trim().slice(0, 250) }));
  const novasFotos = fd.getAll("galeria_novas").filter((f): f is File => f instanceof File && f.size > 0);
  const novasAlt = fd.getAll("galeria_novas_alt").map((a) => String(a).trim().slice(0, 250));
  if (galeria.length + novasFotos.length > MAX_GALERIA) return { erro: `A galeria aceita até ${MAX_GALERIA} imagens.` };
  for (let i = 0; i < novasFotos.length; i++) {
    const r = await salvarImagem(novasFotos[i]);
    if (r === "invalida") return { erro: `A imagem "${novasFotos[i].name}" é inválida. Use JPG, PNG, WEBP ou GIF de até 8 MB.` };
    if (r) galeria.push({ src: r, alt: novasAlt[i] ?? "" });
  }

  const videoBruto = s("video", 300);
  if (videoBruto && !embedDeVideo(videoBruto)) return { erro: "Link de vídeo inválido. Use um endereço do YouTube ou do Vimeo." };

  const chamada = s("chamada", 400) || titulo;
  const corpo = limparHtml(s("corpo", 200_000));
  const alt = s("alt", 250);
  const autor = s("autor", 120) || (atual ? atual.autor : quem.nome);
  const publicado = fd.get("acao") === "publicar" ? 1 : 0;

  if (atual) {
    await sql(
      `UPDATE materias SET editoria=$1, titulo=$2, chamada=$3, corpo=$4, imagem=$5, alt=$6, autor=$7, publicado=$8, galeria=$9, video=$10, atualizado_em=${AGORA_SQL} WHERE id=$11`,
      [editoria, titulo, chamada, corpo, imagem, alt, autor, publicado, JSON.stringify(galeria), videoBruto, atual.id],
    );
  } else {
    const slug = await slugLivre(slugify(titulo));
    await sql(
      "INSERT INTO materias (slug, editoria, titulo, chamada, corpo, imagem, alt, autor, publicado, galeria, video) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [slug, editoria, titulo, chamada, corpo, imagem, alt, autor, publicado, JSON.stringify(galeria), videoBruto],
    );
  }
  revalidatePath("/", "layout");
  redirect(`/admin/materias?ok=${publicado ? "publicada" : "rascunho"}`);
}

export async function excluirMateria(fd: FormData) {
  await exigirUsuario();
  await sql("DELETE FROM materias WHERE id = $1", [Number(fd.get("id"))]);
  revalidatePath("/", "layout");
  redirect("/admin/materias?ok=excluida");
}

export async function alternarPublicacao(fd: FormData) {
  await exigirUsuario();
  await sql(`UPDATE materias SET publicado = 1 - publicado, atualizado_em = ${AGORA_SQL} WHERE id = $1`, [Number(fd.get("id"))]);
  revalidatePath("/", "layout");
  redirect("/admin/materias");
}

/* ---------- Mensagens ---------- */

export async function marcarMensagem(fd: FormData) {
  await exigirUsuario();
  await sql("UPDATE mensagens SET lida = 1 - lida WHERE id = $1", [Number(fd.get("id"))]);
  redirect("/admin/mensagens");
}

export async function excluirMensagem(fd: FormData) {
  await exigirUsuario();
  await sql("DELETE FROM mensagens WHERE id = $1", [Number(fd.get("id"))]);
  redirect("/admin/mensagens");
}

/* ---------- Usuários ---------- */

const LOGIN = /^[a-z0-9._-]{3,30}$/;

export async function criarUsuario(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdministrador();
  const nome = String(fd.get("nome") ?? "").trim().slice(0, 80);
  const login = String(fd.get("usuario") ?? "").trim().toLowerCase();
  const senha = String(fd.get("senha") ?? "");
  const papel = fd.get("papel") === "admin" ? "admin" : "editor";
  if (!nome) return { erro: "Informe o nome." };
  if (!LOGIN.test(login)) return { erro: "Usuário: 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (await usuarioPorLogin(login)) return { erro: "Já existe um usuário com esse login." };
  await sql("INSERT INTO usuarios (usuario, nome, senha_hash, papel) VALUES ($1,$2,$3,$4)", [login, nome, hashSenha(senha), papel]);
  revalidatePath("/admin/usuarios");
  return { ok: `Usuário ${login} criado.` };
}

export async function excluirUsuario(fd: FormData) {
  const eu = await exigirAdministrador();
  const id = Number(fd.get("id"));
  const alvo = await usuarioPorId(id);
  if (!alvo || alvo.id === eu.id) redirect("/admin/usuarios");
  const admins = (await sql<{ n: number }>("SELECT COUNT(*)::int AS n FROM usuarios WHERE papel='admin'"))[0].n;
  if (alvo.papel === "admin" && admins <= 1) redirect("/admin/usuarios");
  await sql("DELETE FROM usuarios WHERE id = $1", [id]);
  redirect("/admin/usuarios");
}

export async function trocarSenha(_: Estado, fd: FormData): Promise<Estado> {
  const eu = await exigirUsuario();
  const atual = String(fd.get("atual") ?? "");
  const nova = String(fd.get("nova") ?? "");
  if (!confereSenha(atual, eu.senha_hash)) return { erro: "A senha atual está incorreta." };
  if (nova.length < 8) return { erro: "A nova senha precisa ter pelo menos 8 caracteres." };
  await sql("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [hashSenha(nova), eu.id]);
  return { ok: "Senha alterada." };
}

export async function redefinirSenha(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdministrador();
  const nova = String(fd.get("nova") ?? "");
  const alvo = await usuarioPorId(Number(fd.get("id")));
  if (!alvo) return { erro: "Usuário não encontrado." };
  if (nova.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  await sql("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [hashSenha(nova), alvo.id]);
  return { ok: `Senha de ${alvo.usuario} redefinida.` };
}
