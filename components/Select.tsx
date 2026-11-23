"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type Item = { value: string; label: string; sub?: string; part?: string; completo?: string };

type Props = {
  labelledBy?: string;
  placeholder?: string;
  items: Item[];
  /** valores selecionados (um item no modo simples) */
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
  max?: number;
  /** lista com fundo preto e letras brancas (usada nas enquetes) */
  dark?: boolean;
  /** separa a lista por letra do alfabeto, em negrito e itálico */
  alphabet?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
};

const inicial = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();

export default function Select({ labelledBy, placeholder = "Clique e selecione", items, value, onChange, multiple, max, dark, alphabet, disabled, required, name }: Props) {
  const uid = useId();
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const linhas = useMemo(() => {
    const out: ({ tipo: "letra"; letra: string } | { tipo: "item"; item: Item; idx: number })[] = [];
    let ult = "";
    items.forEach((item, idx) => {
      if (alphabet) {
        const l = inicial(item.label);
        if (l !== ult) { out.push({ tipo: "letra", letra: l }); ult = l; }
      }
      out.push({ tipo: "item", item, idx });
    });
    return out;
  }, [items, alphabet]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  useEffect(() => {
    if (aberto) document.getElementById(`${uid}-o${ativo}`)?.scrollIntoView({ block: "nearest" });
  }, [ativo, aberto, uid]);

  function abrir() {
    if (disabled) return;
    const i = items.findIndex((x) => value.includes(x.value));
    setAtivo(i < 0 ? 0 : i);
    setAberto(true);
  }

  function escolher(v: string) {
    if (!multiple) { onChange([v]); setAberto(false); return; }
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else if (!max || value.length < max) onChange([...value, v]);
  }

  function tecla(e: React.KeyboardEvent) {
    if (!aberto) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); abrir(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setAtivo((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setAtivo(0); }
    else if (e.key === "End") { e.preventDefault(); setAtivo(items.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (items[ativo]) escolher(items[ativo].value); }
    else if (e.key === "Escape" || e.key === "Tab") setAberto(false);
    else if (e.key.length === 1) {
      const i = items.findIndex((x) => inicial(x.label) === inicial(e.key));
      if (i >= 0) setAtivo(i);
    }
  }

  const rotulos = items.filter((x) => value.includes(x.value)).map((x) => x.label);

  return (
    <div className="sel" ref={raiz}>
      {name && <input type="hidden" name={name} value={value.join("|")} />}
      <button
        type="button"
        className="sel-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${uid}-lb`}
        aria-labelledby={labelledBy}
        aria-required={required}
        aria-activedescendant={aberto ? `${uid}-o${ativo}` : undefined}
        disabled={disabled}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={tecla}
      >
        <span className={rotulos.length ? "" : "ph"}>{rotulos.length ? rotulos.join(", ") : placeholder}</span>
      </button>
      {aberto && (
        <ul id={`${uid}-lb`} role="listbox" aria-multiselectable={multiple} className={`sel-lista${dark ? " escuro" : ""}`} ref={lista} tabIndex={-1}>
          {linhas.map((l, i) =>
            l.tipo === "letra" ? (
              <li key={`l${l.letra}${i}`} className="letra" role="presentation">{l.letra}</li>
            ) : (
              <li
                key={l.item.value}
                id={`${uid}-o${l.idx}`}
                role="option"
                aria-selected={value.includes(l.item.value)}
                data-ativo={l.idx === ativo}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(l.item.value)}
              >
                {l.item.completo ? (
                  <span className="vereador"><span className="v-linha"><b>{l.item.label}</b>{l.item.part && <> - {l.item.part}</>}</span><em>{l.item.completo}</em></span>
                ) : (
                  <>
                    <span>{l.item.label}</span>
                    {l.item.part && <span className="part">· {l.item.part}</span>}
                  </>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
