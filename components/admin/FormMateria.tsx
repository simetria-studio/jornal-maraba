"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { salvarMateria } from "@/app/admin/actions";
import { EDITORIAS } from "@/lib/data";
import type { Materia } from "@/lib/db";
import { MAX_GALERIA, lerGaleria, type FotoGaleria } from "@/lib/galeria";
import { embedDeVideo } from "@/lib/video";
import EditorTexto from "./EditorTexto";

type Nova = { id: string; file: File; url: string; alt: string };

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 8;

export default function FormMateria({ materia }: { materia?: Materia }) {
  const [estado, acao, pendente] = useActionState(salvarMateria, undefined);
  const [titulo, setTitulo] = useState(materia?.titulo ?? "");
  const [chamada, setChamada] = useState(materia?.chamada ?? "");
  const [editoria, setEditoria] = useState(materia?.editoria ?? "");
  const [alt, setAlt] = useState(materia?.alt ?? "");
  const [autor, setAutor] = useState(materia?.autor ?? "");
  const [previa, setPrevia] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);
  const [video, setVideo] = useState(materia?.video ?? "");

  const [atuais, setAtuais] = useState<FotoGaleria[]>(() => lerGaleria(materia?.galeria));
  const [novas, setNovas] = useState<Nova[]>([]);
  const [avisoGaleria, setAvisoGaleria] = useState("");
  const arquivos = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  // O campo de arquivos do formulário precisa refletir a lista de fotos novas.
  useEffect(() => {
    if (!arquivos.current) return;
    const dt = new DataTransfer();
    novas.forEach((n) => dt.items.add(n.file));
    arquivos.current.files = dt.files;
  }, [novas]);

  const imagemAtual = remover ? "" : (previa ?? materia?.imagem ?? "");
  const total = atuais.length + novas.length;
  const embed = video.trim() ? embedDeVideo(video) : null;

  function adicionarFotos(lista: FileList | null) {
    if (!lista) return;
    const recusadas: string[] = [];
    const aceitas: Nova[] = [];
    for (const f of Array.from(lista)) {
      if (!TIPOS.includes(f.type) || f.size > MAX_MB * 1024 * 1024) { recusadas.push(f.name); continue; }
      if (total + aceitas.length >= MAX_GALERIA) { recusadas.push(f.name); continue; }
      aceitas.push({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f), alt: "" });
    }
    setAvisoGaleria(recusadas.length ? `Não adicionadas (formato, tamanho acima de ${MAX_MB} MB ou limite de ${MAX_GALERIA} imagens): ${recusadas.join(", ")}` : "");
    setNovas((n) => [...n, ...aceitas]);
  }

  function mover<T>(lista: T[], de: number, para: number): T[] {
    if (para < 0 || para >= lista.length) return lista;
    const c = [...lista];
    [c[de], c[para]] = [c[para], c[de]];
    return c;
  }

  return (
    <form action={acao} encType="multipart/form-data" className="p-editor">
      {materia && <input type="hidden" name="id" value={materia.id} />}
      <input type="hidden" name="galeria_atual" value={JSON.stringify(atuais)} />
      <input ref={arquivos} type="file" name="galeria_novas" multiple hidden tabIndex={-1} aria-hidden />
      {novas.map((n) => <input key={n.id} type="hidden" name="galeria_novas_alt" value={n.alt} />)}

      <div className="p-barra-acoes">
        <div className="situacao">
          <span className={`p-selo ${materia ? (materia.publicado ? "pub" : "rasc") : "nova"}`}>
            {materia ? (materia.publicado ? "Publicada" : "Rascunho") : "Nova matéria"}
          </span>
          <span className="p-dica">{pendente ? "Salvando…" : "As alterações só valem depois de salvar."}</span>
        </div>
        <div className="botoes">
          <Link href="/admin/materias" className="p-link">Cancelar</Link>
          <button type="submit" name="acao" value="rascunho" className="p-btn sec" disabled={pendente}>
            {materia?.publicado ? "Voltar para rascunho" : "Salvar rascunho"}
          </button>
          <button type="submit" name="acao" value="publicar" className="p-btn" disabled={pendente}>
            {materia?.publicado ? "Salvar alterações" : "Publicar agora"}
          </button>
        </div>
      </div>

      <div className="principal">
        {estado?.erro && <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>{estado.erro}</p>}

        <section className="p-bloco">
          <label className="p-campo titulo-campo">
            <span className="p-rotulo-oculto">Título</span>
            <input name="titulo" required maxLength={250} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título da matéria" />
          </label>
          <label className="p-campo">
            <span>Chamada</span>
            <small>Resumo que aparece na home e nas editorias. Se ficar vazio, usa o título. Escreva **assim** para pôr em negrito.</small>
            <textarea name="chamada" rows={2} maxLength={400} value={chamada} onChange={(e) => setChamada(e.target.value)} />
            <span className={`p-contador ${chamada.length > 360 ? "alto" : ""}`}>{chamada.length}/400</span>
          </label>
        </section>

        <section className="p-bloco">
          <h2 className="p-bloco-t">Texto da matéria</h2>
          <p className="p-dica">Selecione um trecho e use a barra para negrito, título, lista ou link. Pode colar do Word ou do Google Docs.</p>
          <EditorTexto nome="corpo" inicial={materia?.corpo ?? ""} />
        </section>

        <section className="p-bloco">
          <div className="p-bloco-cab">
            <h2 className="p-bloco-t">Carrossel de imagens</h2>
            <span className="p-dica">{total} de {MAX_GALERIA}</span>
          </div>
          <p className="p-dica">Fotos extras que aparecem na matéria como um carrossel. Escreva a descrição de cada uma: ela é lida por leitores de tela.</p>

          {avisoGaleria && <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>{avisoGaleria}</p>}

          {total > 0 && (
            <ul className="p-galeria">
              {atuais.map((f, i) => (
                <li key={f.src} className="p-foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt="" />
                  <input aria-label={`Descrição da imagem ${i + 1}`} placeholder="Descrição da imagem" maxLength={250} value={f.alt}
                    onChange={(e) => setAtuais((l) => l.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} />
                  <div className="acoes">
                    <button type="button" onClick={() => setAtuais((l) => mover(l, i, i - 1))} disabled={i === 0} aria-label="Mover para antes">←</button>
                    <button type="button" onClick={() => setAtuais((l) => mover(l, i, i + 1))} disabled={i === atuais.length - 1} aria-label="Mover para depois">→</button>
                    <button type="button" className="rm" onClick={() => setAtuais((l) => l.filter((_, k) => k !== i))}>Remover</button>
                  </div>
                </li>
              ))}
              {novas.map((n, i) => (
                <li key={n.id} className="p-foto nova">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.url} alt="" />
                  <span className="p-selo nova">Nova</span>
                  <input aria-label={`Descrição da imagem nova ${i + 1}`} placeholder="Descrição da imagem" maxLength={250} value={n.alt}
                    onChange={(e) => setNovas((l) => l.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} />
                  <div className="acoes">
                    <button type="button" onClick={() => setNovas((l) => mover(l, i, i - 1))} disabled={i === 0} aria-label="Mover para antes">←</button>
                    <button type="button" onClick={() => setNovas((l) => mover(l, i, i + 1))} disabled={i === novas.length - 1} aria-label="Mover para depois">→</button>
                    <button type="button" className="rm" onClick={() => { URL.revokeObjectURL(n.url); setNovas((l) => l.filter((_, k) => k !== i)); }}>Remover</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {total < MAX_GALERIA && (
            <label className="p-solta">
              <input type="file" accept={TIPOS.join(",")} multiple onChange={(e) => { adicionarFotos(e.target.files); e.target.value = ""; }} />
              <strong>Adicionar imagens</strong>
              <span>JPG, PNG, WEBP ou GIF, até {MAX_MB} MB cada. Pode escolher várias de uma vez.</span>
            </label>
          )}
        </section>

        <section className="p-bloco">
          <h2 className="p-bloco-t">Vídeo</h2>
          <label className="p-campo">
            <span className="p-rotulo-oculto">Link do vídeo</span>
            <small>Cole o endereço de um vídeo do YouTube ou do Vimeo. Ele aparece dentro da matéria. Deixe vazio para não usar vídeo.</small>
            <input name="video" type="url" maxLength={300} value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
          </label>
          {video.trim() && !embed && <p role="alert" className="p-aviso erro" style={{ margin: 0 }}>Esse endereço não é do YouTube nem do Vimeo.</p>}
          {embed && (
            <div className="p-video">
              <iframe src={embed} title="Prévia do vídeo" loading="lazy" allowFullScreen />
            </div>
          )}
        </section>
      </div>

      <div className="lateral">
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
          <header><h2>Foto de capa</h2></header>
          <div className="p-corpo p-form">
            {imagemAtual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="p-previa" src={imagemAtual} alt="Prévia da foto de capa" />
            ) : (
              <div className="p-previa-vazia">Sem foto de capa</div>
            )}
            <label className="p-solta pequena">
              <input
                type="file" name="imagem" accept={TIPOS.join(",")}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPrevia(f ? URL.createObjectURL(f) : null);
                  setRemover(false);
                }}
              />
              <strong>{materia?.imagem || previa ? "Trocar a foto" : "Escolher a foto"}</strong>
              <span>Aparece na home e no topo da matéria.</span>
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

        <section className="p-painel">
          <header><h2>Como aparece na home</h2></header>
          <div className="p-corpo">
            <div className="p-cartao">
              {imagemAtual && /* eslint-disable-next-line @next/next/no-img-element */ <img src={imagemAtual} alt="" />}
              <p className="ed">{EDITORIAS.find((e) => e.slug === editoria)?.nome ?? "Editoria"}</p>
              <p className="ti">{titulo || "O título aparece aqui"}</p>
              <p className="ch">{(chamada || titulo).replace(/\*\*/g, "")}</p>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
