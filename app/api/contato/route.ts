import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

const ASSUNTOS = ["Publicidade", "Sugerir Pautas", "Fazer Denúncia", "Elogios"];

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ erro: "JSON inválido" }, { status: 400 }); }

  const s = (k: string, max = 200) => String(b[k] ?? "").trim().slice(0, max);
  const dados = {
    nome: s("nome"), email: s("email"), whatsapp: s("whatsapp", 20), municipio: s("municipio"),
    estado: s("estado"), assunto: s("assunto"), editoria: s("editoria"), mensagem: s("mensagem", 5000),
  };
  if (!dados.nome || !/^\S+@\S+\.\S+$/.test(dados.email) || !dados.mensagem || !ASSUNTOS.includes(dados.assunto)) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 422 });
  }

  await sql(
    "INSERT INTO mensagens (nome, email, whatsapp, estado, municipio, assunto, editoria, mensagem) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [dados.nome, dados.email, dados.whatsapp, dados.estado, dados.municipio, dados.assunto, dados.editoria, dados.mensagem],
  );
  return NextResponse.json({ ok: true });
}
