"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { salvarMateria } from "@/app/admin/actions";
import { EDITORIAS } from "@/lib/data";
import type { Materia } from "@/lib/db";
import EditorTexto from "./EditorTexto";

export default function FormMateria({ materia }: { materia?: Materia }) {
  const [estado, acao, pendente] = useActionState(salvarMateria, undefined);
  const [titulo, setTitulo] = useState(materia?.titulo ?? "");
  const [chamada, setChamada] = useState(materia?.chamada ?? "");
  const corpo = materia?.corpo ?? "";
  const [editoria, setEditoria] = useState(materia?.editoria ?? "");
  const [alt, setAlt] = useState(materia?.alt ?? "");
  const [autor, setAutor] = useState(materia?.autor ?? "");
  const [previa, setPrevia] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  const imagemAtual = remover ? "" : (previa ?? materia?.imagem ?? "");

  return (
    <form action={acao} encType="multipart/form-data" className="p-editor">
      {materia && <input type="hidden" name="id" value={materia.id} />}

      <div className="principal">
        {estado?.erro && <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>{estado.erro}</p>}
        <label className="p-campo titulo-campo">
          <span>Título</span>
          <input name="titulo" required maxLength={250} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </label>
        <label className="p-campo">
          <span>Chamada</span>
          <small>Texto curto que aparece na home e nas editorias. Se ficar vazio, usa o título. Escreva **assim** para pôr em negrito.</small>
          <textarea name="chamada" rows={2} maxLength={400} value={chamada} onChange={(e) => setChamada(e.target.value)} />
          <span className={`p-contador ${chamada.length > 360 ? "alto" : ""}`}>{chamada.length}/400</span>
        </label>
        <div className="p-campo">
          <span>Texto da matéria</span>
          <small>Selecione um trecho e use a barra para negrito, título, lista ou link. Pode colar do Word ou do Google Docs.</small>
          <EditorTexto nome="corpo" inicial={corpo} />
        </div>
      </div>

      <div className="lateral">
        <section className="p-painel">
          <header><h2>Publicação</h2></header>
          <div className="p-corpo p-acoes-form">
            <p className="p-dica" style={{ margin: 0 }}>
              {materia ? (materia.publicado ? "Situação atual: publicada." : "Situação atual: rascunho.") : "Nova matéria."}
            </p>
            <button type="submit" name="acao" value="publicar" className="p-btn" disabled={pendente}>
              {pendente ? "Salvando…" : materia?.publicado ? "Salvar alterações" : "Publicar"}
            </button>
            <button type="submit" name="acao" value="rascunho" className="p-btn sec" disabled={pendente}>
              {materia?.publicado ? "Voltar para rascunho" : "Salvar como rascunho"}
            </button>
            <Link href="/admin/materias" style={{ textAlign: "center" }}>Cancelar</Link>
          </div>
        </section>

        <section className="p-painel">
          <header><h2>Detalhes</h2></header>
          <div className="p-corpo p-form">
            <label className="p-campo">
              <span>Editoria</span>
              <select name="editoria" required value={editoria} onChange={(e) => setEditoria(e.target.value)}>
                <option value="" disabled>Escolha…</option>
                {EDITORIAS.filter((e) => e.slug !== "colunistas").map((e) => <option key={e.slug} value={e.slug}>{e.nome}</option>)}
              </select>
            </label>
            <label className="p-campo">
              <span>Autor</span>
              <input name="autor" maxLength={120} value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Seu nome, se ficar vazio" />
            </label>
          </div>
        </section>

        <section className="p-painel">
          <header><h2>Foto</h2></header>
          <div className="p-corpo p-form">
            {imagemAtual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="p-previa" src={imagemAtual} alt="Prévia da foto" />
            ) : (
              <div className="p-previa-vazia">Sem foto</div>
            )}
            <label className="p-campo">
              <span>{materia?.imagem ? "Trocar foto" : "Enviar foto"}</span>
              <small>JPG, PNG, WEBP ou GIF, até 8 MB.</small>
              <input
                type="file" name="imagem" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPrevia(f ? URL.createObjectURL(f) : null);
                  setRemover(false);
                }}
              />
            </label>
            {materia?.imagem && (
              <label className="p-check">
                <input type="checkbox" name="remover_imagem" checked={remover} onChange={(e) => setRemover(e.target.checked)} />
                Remover a foto atual
              </label>
            )}
            <label className="p-campo">
              <span>Descrição da foto</span>
              <small>Lida por leitores de tela.</small>
              <input name="alt" maxLength={250} value={alt} onChange={(e) => setAlt(e.target.value)} />
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}
