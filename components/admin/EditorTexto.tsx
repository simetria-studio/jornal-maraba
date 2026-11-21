"use client";

import { useEffect, useRef, useState } from "react";
import { limparHtml, textoParaHtml } from "@/lib/html";

type Botao = { rotulo: string; titulo: string; cmd: string; arg?: string; estilo?: React.CSSProperties };

const GRUPOS: Botao[][] = [
  [
    { rotulo: "N", titulo: "Negrito (Ctrl+B)", cmd: "bold", estilo: { fontWeight: 900 } },
    { rotulo: "I", titulo: "Itálico (Ctrl+I)", cmd: "italic", estilo: { fontStyle: "italic" } },
    { rotulo: "S", titulo: "Sublinhado (Ctrl+U)", cmd: "underline", estilo: { textDecoration: "underline" } },
  ],
  [
    { rotulo: "Título", titulo: "Título de seção", cmd: "formatBlock", arg: "h2" },
    { rotulo: "Subtítulo", titulo: "Subtítulo", cmd: "formatBlock", arg: "h3" },
    { rotulo: "Texto", titulo: "Parágrafo normal", cmd: "formatBlock", arg: "p" },
  ],
  [
    { rotulo: "• Lista", titulo: "Lista com marcadores", cmd: "insertUnorderedList" },
    { rotulo: "1. Lista", titulo: "Lista numerada", cmd: "insertOrderedList" },
    { rotulo: "“ Citação", titulo: "Citação", cmd: "formatBlock", arg: "blockquote" },
  ],
];

export default function EditorTexto({ nome, inicial }: { nome: string; inicial: string }) {
  const area = useRef<HTMLDivElement>(null);
  const [valor, setValor] = useState(() => textoParaHtml(inicial));
  const [palavras, setPalavras] = useState(0);

  useEffect(() => {
    if (area.current) {
      area.current.innerHTML = textoParaHtml(inicial);
      contar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function contar() {
    const t = area.current?.innerText.trim() ?? "";
    setPalavras(t ? t.split(/\s+/).length : 0);
  }

  function sincronizar() {
    const el = area.current;
    if (!el) return;
    setValor(el.innerText.trim() ? limparHtml(el.innerHTML) : "");
    contar();
  }

  function comando(cmd: string, arg?: string) {
    area.current?.focus();
    document.execCommand(cmd, false, arg);
    sincronizar();
  }

  function link() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      window.alert("Selecione primeiro o trecho do texto que vai virar link.");
      return;
    }
    const salvo = sel.getRangeAt(0).cloneRange();
    const url = window.prompt("Endereço do link (comece com https://)", "https://");
    if (!url || url === "https://") return;
    sel.removeAllRanges();
    sel.addRange(salvo);
    comando("createLink", /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`);
  }

  function colar(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const texto = e.clipboardData.getData("text/plain");
    if (html) document.execCommand("insertHTML", false, limparHtml(html));
    else document.execCommand("insertHTML", false, textoParaHtml(texto));
    sincronizar();
  }

  return (
    <div className="p-rico">
      <div className="p-barra" role="toolbar" aria-label="Formatação do texto">
        {GRUPOS.map((g, i) => (
          <span className="grupo" key={i}>
            {g.map((b) => (
              <button key={b.titulo} type="button" title={b.titulo} aria-label={b.titulo} style={b.estilo}
                onMouseDown={(e) => e.preventDefault()} onClick={() => comando(b.cmd, b.arg)}>{b.rotulo}</button>
            ))}
          </span>
        ))}
        <span className="grupo">
          <button type="button" title="Inserir link" aria-label="Inserir link" onMouseDown={(e) => e.preventDefault()} onClick={link}>Link</button>
          <button type="button" title="Remover link" aria-label="Remover link" onMouseDown={(e) => e.preventDefault()} onClick={() => comando("unlink")}>Sem link</button>
        </span>
        <span className="grupo">
          <button type="button" title="Desfazer (Ctrl+Z)" aria-label="Desfazer" onMouseDown={(e) => e.preventDefault()} onClick={() => comando("undo")}>↶</button>
          <button type="button" title="Refazer (Ctrl+Y)" aria-label="Refazer" onMouseDown={(e) => e.preventDefault()} onClick={() => comando("redo")}>↷</button>
          <button type="button" title="Limpar formatação do trecho selecionado" aria-label="Limpar formatação" onMouseDown={(e) => e.preventDefault()} onClick={() => comando("removeFormat")}>Limpar</button>
        </span>
      </div>
      <div
        ref={area}
        className="p-area"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Texto da matéria"
        data-vazio="Escreva ou cole o texto da matéria aqui."
        suppressContentEditableWarning
        onInput={sincronizar}
        onBlur={sincronizar}
        onPaste={colar}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); link(); }
        }}
      />
      <div className="p-rodape-editor"><span>{palavras} {palavras === 1 ? "palavra" : "palavras"}</span><span>Ctrl+K cria link</span></div>
      <input type="hidden" name={nome} value={valor} />
    </div>
  );
}
