"use client";

import { useEffect, useMemo, useState } from "react";
import Select, { type Item } from "./Select";
import { VEREADORES } from "@/lib/data";

type Voto = { desempenho: "bom" | "razoavel" | "ruim"; bons: string[]; destaque: string };
type Urna = { votos: Voto[] };

const CHAVE = "jm-enquete-camara-v1";
const LABEL = { bom: "Bom", razoavel: "Razoável", ruim: "Ruim" } as const;

function lerUrna(): Urna {
  try { return JSON.parse(localStorage.getItem(CHAVE) || "") as Urna; } catch { return { votos: [] }; }
}

const itensVereadores: Item[] = VEREADORES.map((v) => ({ value: v.nome, label: v.nome, part: v.partido, completo: v.completo }));

export default function PesquisaPopular() {
  const [desempenho, setDesempenho] = useState<Voto["desempenho"] | "">("");
  const [bons, setBons] = useState<string[]>([]);
  const [destaque, setDestaque] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ t: string; erro?: boolean }>({ t: "" });
  const [mostrar, setMostrar] = useState(false);
  const [urna, setUrna] = useState<Urna>({ votos: [] });
  const [jaVotou, setJaVotou] = useState(false);

  useEffect(() => {
    setUrna(lerUrna());
    try { setJaVotou(localStorage.getItem(CHAVE + "-votou") === "1"); } catch {}
  }, []);

  // O destaque só pode ser escolhido entre os vereadores indicados acima
  const itensDestaque = useMemo(() => itensVereadores.filter((i) => bons.includes(i.value)), [bons]);
  useEffect(() => { setDestaque((d) => d.filter((x) => bons.includes(x))); }, [bons]);

  function votar() {
    if (jaVotou) return setMsg({ t: "Este navegador já registrou um voto nesta enquete.", erro: true });
    if (!desempenho) return setMsg({ t: "Escolha como avalia a Câmara: Bom, Razoável ou Ruim.", erro: true });
    if (bons.length < 1) return setMsg({ t: "Indique de 1 até 5 vereadores de bons projetos de lei.", erro: true });
    if (!destaque[0]) return setMsg({ t: "Escolha, entre os indicados, o destaque pela excelência do mandato.", erro: true });
    const nova: Urna = { votos: [...urna.votos, { desempenho, bons, destaque: destaque[0] }] };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova));
      localStorage.setItem(CHAVE + "-votou", "1");
    } catch {}
    setUrna(nova); setJaVotou(true); setMostrar(true);
    setMsg({ t: "Voto registrado. Obrigado por participar!" });
  }

  const total = urna.votos.length;
  const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);
  const contDesemp = (["bom", "razoavel", "ruim"] as const).map((k) => ({ k, n: urna.votos.filter((v) => v.desempenho === k).length }));
  const contar = (get: (v: Voto) => string[]) => {
    const m = new Map<string, number>();
    urna.votos.forEach((v) => get(v).forEach((n) => m.set(n, (m.get(n) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };
  const topBons = contar((v) => v.bons);
  const topDest = contar((v) => [v.destaque]);

  return (
    <section className="pesquisa" aria-labelledby="pp-titulo">
      <h2 id="pp-titulo">Pesquisa Popular</h2>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="q" style={{ display: "block", margin: "1rem auto .6rem", fontSize: "1.05rem" }}>
          O desempenho da <b>CÂMARA DE VEREADORES DE MARABÁ</b> tem sido:
        </legend>
        <div className="opcoes">
          {(["bom", "razoavel", "ruim"] as const).map((k) => (
            <label key={k} className={k === "ruim" ? "ruim-txt" : undefined}>
              <input type="radio" name="desempenho" value={k} checked={desempenho === k} onChange={() => setDesempenho(k)} />
              <span className={`bola ${k}`} aria-hidden="true" />
              {LABEL[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="q" id="pp-bons">Indique de 1 até 5 <b>VEREADORES DE BONS PROJETOS DE LEI</b>:</p>
      <Select labelledBy="pp-bons" placeholder="Click e Selecione" items={itensVereadores} value={bons} onChange={setBons} multiple max={5} dark />
      <p className="nota" style={{ textAlign: "left" }} aria-live="polite">{bons.length}/5 indicados</p>

      <p className="q" id="pp-dest">Das suas escolhas acima, <b>O DESTAQUE PELA EXCELÊNCIA DO MANDATO É</b>:</p>
      <Select labelledBy="pp-dest" items={itensDestaque} value={destaque} onChange={setDestaque} dark disabled={!bons.length} placeholder={bons.length ? "Click e Selecione" : "Indique vereadores acima"} />

      <div className="acoes">
        <button type="button" className="btn" onClick={votar}>Votar</button>
        <button type="button" className="btn" onClick={() => setMostrar((v) => !v)} aria-expanded={mostrar}>Ver Resultados</button>
      </div>
      <p className={`msg-form${msg.erro ? " erro" : ""}`} role="status" aria-live="polite">{msg.t}</p>

      {mostrar && (
        <div className="resultado">
          <strong>{total ? `${total} ${total === 1 ? "voto" : "votos"} neste navegador` : "Ainda não há votos registrados."}</strong>
          {total > 0 && (
            <>
              <h3>Desempenho da Câmara</h3>
              {contDesemp.map(({ k, n }) => (
                <div key={k} className={`barra ${k}`}>
                  <span>{LABEL[k]}</span>
                  <i><s style={{ width: `${pct(n, total)}%` }} /></i>
                  <span>{pct(n, total)}%</span>
                </div>
              ))}
              <h3>Mais indicados por bons projetos de lei</h3>
              {topBons.map(([n, c]) => (
                <div key={n} className="barra"><span>{n}</span><i><s style={{ width: `${pct(c, total)}%` }} /></i><span>{c}</span></div>
              ))}
              <h3>Destaques pela excelência do mandato</h3>
              {topDest.map(([n, c]) => (
                <div key={n} className="barra"><span>{n}</span><i><s style={{ width: `${pct(c, total)}%` }} /></i><span>{c}</span></div>
              ))}
            </>
          )}
          <p className="nota">Por enquanto os votos ficam salvos apenas neste navegador. Para um resultado geral do site é preciso ligar a enquete a um banco de dados.</p>
        </div>
      )}
    </section>
  );
}
