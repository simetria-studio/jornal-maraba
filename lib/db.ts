import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { hashSenha } from "./senha";
import { MATERIA_VIOLENCIA_CORPO } from "./materia-violencia";

export type Materia = {
  id: number;
  slug: string;
  editoria: string;
  titulo: string;
  chamada: string;
  corpo: string;
  imagem: string;
  alt: string;
  galeria: string; // JSON: [{ src, alt }]
  video: string;
  autor: string;
  publicado: number;
  criado_em: string;
  atualizado_em: string;
};

export type Usuario = {
  id: number;
  usuario: string;
  nome: string;
  senha_hash: string;
  papel: "admin" | "editor";
  criado_em: string;
};

export type Mensagem = {
  id: number;
  lida: number;
  nome: string;
  email: string;
  whatsapp: string;
  estado: string;
  municipio: string;
  assunto: string;
  editoria: string;
  mensagem: string;
  criado_em: string;
};

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

/** Data/hora atual em UTC, no formato "AAAA-MM-DD HH:MM:SS" (usado nas colunas de texto). */
export const AGORA_SQL = "to_char(timezone('utc', now()), 'YYYY-MM-DD HH24:MI:SS')";

const g = globalThis as unknown as { __pool?: Pool; __pronto?: Promise<void> };

function pool(): Pool {
  if (!g.__pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Defina DATABASE_URL no .env (ex.: postgresql://usuario:senha@localhost:5432/jornal).");
    g.__pool = new Pool({
      connectionString: url,
      max: 10,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return g.__pool;
}

async function preparar(): Promise<void> {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const p = pool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS materias (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      editoria TEXT NOT NULL,
      titulo TEXT NOT NULL,
      chamada TEXT NOT NULL DEFAULT '',
      corpo TEXT NOT NULL DEFAULT '',
      imagem TEXT NOT NULL DEFAULT '',
      alt TEXT NOT NULL DEFAULT '',
      autor TEXT NOT NULL DEFAULT '',
      publicado INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT ${AGORA_SQL},
      atualizado_em TEXT NOT NULL DEFAULT ${AGORA_SQL}
    );
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL, email TEXT NOT NULL, whatsapp TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT '', municipio TEXT NOT NULL DEFAULT '',
      assunto TEXT NOT NULL DEFAULT '', editoria TEXT NOT NULL DEFAULT '',
      mensagem TEXT NOT NULL,
      lida INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT ${AGORA_SQL}
    );
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      usuario TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL DEFAULT 'editor',
      criado_em TEXT NOT NULL DEFAULT ${AGORA_SQL}
    );
    ALTER TABLE materias ADD COLUMN IF NOT EXISTS galeria TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE materias ADD COLUMN IF NOT EXISTS video TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS materias_editoria_idx ON materias (editoria, criado_em DESC);
  `);

  const { rows: [u] } = await p.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM usuarios");
  if (u.n === 0) {
    const senha = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "admin");
    if (!senha) throw new Error("Defina ADMIN_PASSWORD no .env para criar o primeiro usuário.");
    await p.query("INSERT INTO usuarios (usuario, nome, senha_hash, papel) VALUES ($1,$2,$3,'admin') ON CONFLICT DO NOTHING", [
      (process.env.ADMIN_USER ?? "admin").toLowerCase(),
      "Administrador",
      hashSenha(senha),
    ]);
  }

  const { rows: [m] } = await p.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM materias");
  if (m.n === 0) {
    const ins = "INSERT INTO materias (slug, editoria, titulo, chamada, imagem, alt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING";
    const t1 = "Rede de proteção contra a violência doméstica e o feminicídio atua amplamente em Marabá";
    const t2 = "Raimundo Neto, presidente do SINDICOM, prevê fortalecimento das ações beneficiando setores do comércio";
    await p.query(ins, ["rede-de-protecao-violencia-domestica-feminicidio-maraba", "cidadania", t1, t1, "/img/foto-cidadania.png", "Mulher cobrindo o rosto com as mãos"]);
    await p.query(ins, ["raimundo-neto-sindicom-fortalecimento-comercio", "comercio", t2, "**Raimundo Neto**" + t2.slice(14), "/img/foto-comercio.png", "Raimundo Neto, presidente do SINDICOM"]);
  }

  // Texto completo e fotos da matéria sobre violência contra a mulher (só preenche se ainda estiver vazia)
  await p.query(
    "UPDATE materias SET corpo = $1, imagem = $2, alt = $3, autor = $4, titulo = $5 WHERE slug = $6 AND corpo = ''",
    [MATERIA_VIOLENCIA_CORPO, "/img/violencia/principal.png", "Mulher com as mãos sobre a boca, símbolo do silêncio diante da violência", "Carlos Santos", "Violência contra a mulher: identifique, proteja e denuncie", "rede-de-protecao-violencia-domestica-feminicidio-maraba"],
  );
}

/** Executa uma consulta (cria as tabelas e os dados iniciais na primeira vez). */
export async function sql<T = Record<string, unknown>>(texto: string, params: unknown[] = []): Promise<T[]> {
  const pronto = (g.__pronto ??= preparar().catch((e) => {
    g.__pronto = undefined;
    throw e;
  }));
  await pronto;
  return (await pool().query(texto, params)).rows as T[];
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export async function listarMaterias(opts: { editoria?: string; todas?: boolean } = {}): Promise<Materia[]> {
  const where: string[] = [];
  const args: string[] = [];
  if (!opts.todas) where.push("publicado = 1");
  if (opts.editoria) {
    args.push(opts.editoria);
    where.push(`editoria = $${args.length}`);
  }
  return sql<Materia>(
    `SELECT * FROM materias ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY criado_em DESC, id DESC`,
    args,
  );
}

export async function materiaPorSlug(slug: string, incluirRascunho = false): Promise<Materia | undefined> {
  const [m] = await sql<Materia>("SELECT * FROM materias WHERE slug = $1", [slug]);
  if (m && !m.publicado && !incluirRascunho) return undefined;
  return m;
}

export async function materiaPorId(id: number): Promise<Materia | undefined> {
  if (!Number.isInteger(id)) return undefined;
  return (await sql<Materia>("SELECT * FROM materias WHERE id = $1", [id]))[0];
}

export async function slugLivre(base: string, ignorarId?: number) {
  let slug = base || "materia";
  let i = 2;
  for (;;) {
    const [r] = await sql<{ id: number }>("SELECT id FROM materias WHERE slug = $1", [slug]);
    if (!r || r.id === ignorarId) return slug;
    slug = `${base || "materia"}-${i++}`;
  }
}

export function listarMensagens(): Promise<Mensagem[]> {
  return sql<Mensagem>("SELECT * FROM mensagens ORDER BY id DESC");
}

export async function usuarioPorLogin(login: string): Promise<Usuario | undefined> {
  return (await sql<Usuario>("SELECT * FROM usuarios WHERE usuario = $1", [login.toLowerCase()]))[0];
}
export async function usuarioPorId(id: number): Promise<Usuario | undefined> {
  if (!Number.isInteger(id)) return undefined;
  return (await sql<Usuario>("SELECT * FROM usuarios WHERE id = $1", [id]))[0];
}
export function listarUsuarios(): Promise<Usuario[]> {
  return sql<Usuario>("SELECT * FROM usuarios ORDER BY nome");
}
export async function contagens() {
  const [r] = await sql<{ publicadas: number; rascunhos: number; novas: number }>(
    `SELECT
       (SELECT COUNT(*)::int FROM materias WHERE publicado = 1) AS publicadas,
       (SELECT COUNT(*)::int FROM materias WHERE publicado = 0) AS rascunhos,
       (SELECT COUNT(*)::int FROM mensagens WHERE lida = 0) AS novas`,
  );
  return { publicadas: r.publicadas, rascunhos: r.rascunhos, novasMensagens: r.novas };
}
