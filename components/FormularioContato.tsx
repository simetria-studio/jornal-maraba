"use client";

import { useState } from "react";
import Select, { type Item } from "./Select";
import { ASSUNTOS, EDITORIAS, ESTADOS } from "@/lib/data";
import { MUNICIPIOS_PA } from "@/lib/content.generated";

const toItems = (a: readonly string[]): Item[] => a.map((x) => ({ value: x, label: x }));
const municipios = toItems(MUNICIPIOS_PA);
const estados = toItems(ESTADOS);
const assuntos = toItems(ASSUNTOS);
const editorias = toItems(EDITORIAS.map((e) => e.nome));

const OBR = <span className="obrig"> *O campo acima é de preenchimento obrigatório</span>;

export default function FormularioContato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whats, setWhats] = useState("");
  const [muni, setMuni] = useState<string[]>([]);
  const [uf, setUf] = useState<string[]>([]);
  const [assunto, setAssunto] = useState<string[]>([]);
  const [editoria, setEditoria] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(false);
  const [falha, setFalha] = useState("");

  const naoEPublicidade = assunto[0] && assunto[0] !== "Publicidade";
  const doPara = uf[0] === "Pará";

  function mascaraTel(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!nome.trim()) er.nome = "Informe seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = "Informe um e-mail válido.";
    if (!uf[0]) er.uf = "Escolha o estado de onde você acessa.";
    if (doPara && !muni[0]) er.muni = "Escolha o município do Pará.";
    if (!assunto[0]) er.assunto = "Escolha o assunto.";
    if (naoEPublicidade && !editoria[0]) er.editoria = "Escolha a editoria.";
    if (!mensagem.trim()) er.mensagem = "Escreva sua mensagem.";
    setErros(er);
    if (Object.keys(er).length) {
      document.getElementById("form-erros")?.focus();
      return;
    }
    setEnviando(true); setFalha("");
    try {
      const r = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, whatsapp: whats, municipio: muni[0] || "", estado: uf[0], assunto: assunto[0], editoria: editoria[0] || "", mensagem }),
      });
      if (!r.ok) throw new Error();
      setFeito(true);
    } catch {
      setFalha("Não foi possível enviar agora. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  if (feito) {
    return (
      <div className="feito" role="status">
        <strong>Mensagem enviada.</strong> Obrigado, {nome.split(" ")[0]}! Retornaremos pelo e-mail informado.
      </div>
    );
  }

  const lista = Object.values(erros);
  return (
    <form className="contato" onSubmit={enviar} noValidate>
      <div id="form-erros" tabIndex={-1} aria-live="assertive">
        {lista.length > 0 && <p className="msg-form erro">Corrija para enviar: {lista.join(" ")}</p>}
      </div>

      <div className="campo">
        <label htmlFor="c-nome">Nome</label>
        <input id="c-nome" type="text" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} required aria-invalid={!!erros.nome} />
        {OBR}
      </div>

      <div className="campo">
        <label htmlFor="c-email">E-mail</label>
        <input id="c-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-invalid={!!erros.email} />
        {OBR}
      </div>

      <div className="campo">
        <label htmlFor="c-whats">WhatsApp de contato <small style={{ fontFamily: "var(--f-corpo)" }}>(DDD e número)</small></label>
        <input id="c-whats" type="tel" inputMode="tel" autoComplete="tel" value={whats} onChange={(e) => setWhats(mascaraTel(e.target.value))} placeholder="(94) 99999-9999" />
      </div>

      <div className="grid-2">
        <div className="campo">
          <span className="rotulo-ui" id="c-uf">*Estado do Brasil de onde você acessa:</span>
          <Select labelledBy="c-uf" items={estados} value={uf} onChange={(v) => { setUf(v); if (v[0] !== "Pará") setMuni([]); }} />
          {OBR}
        </div>
        <div className="campo">
          <span className="rotulo-ui" id="c-muni">*Município do Pará de onde você acessa:</span>
          <Select labelledBy="c-muni" items={municipios} value={muni} onChange={setMuni} alphabet disabled={!doPara} placeholder={doPara ? "Clique e selecione" : "Escolha o estado Pará"} />
          {OBR}
        </div>
      </div>

      <div className="campo">
        <span id="c-ass">Assunto</span>
        <Select labelledBy="c-ass" items={assuntos} value={assunto} onChange={setAssunto} />
        {OBR}
      </div>

      {naoEPublicidade && (
        <div className="campo">
          <span id="c-edit">*Editoria</span>
          <Select labelledBy="c-edit" items={editorias} value={editoria} onChange={setEditoria} />
          {OBR}
        </div>
      )}

      {assunto[0] && (
        <div className="campo">
          <label htmlFor="c-msg" className="rotulo-ui" style={{ fontFamily: "var(--f-ui)", fontWeight: 700 }}>*{assunto[0] === "Publicidade" ? "Publicidade" : "Mensagem"}</label>
          <textarea id="c-msg" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required aria-invalid={!!erros.mensagem} />
          {OBR}
        </div>
      )}

      {falha && <p className="msg-form erro" role="alert">{falha}</p>}
      <div>
        <button className="btn" type="submit" disabled={enviando}>{enviando ? "Enviando…" : "Enviar mensagem"}</button>
      </div>
    </form>
  );
}
