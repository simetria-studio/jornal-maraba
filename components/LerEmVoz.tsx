"use client";

import { useEffect, useRef, useState } from "react";

const VELOCIDADES = [0.8, 1, 1.25, 1.5];

/** Lê o texto da página em voz feminina (Web Speech API do navegador). */
export default function LerEmVoz({ alvo, rotulo = "Ouvir esta página", velocidade = false, compacto = false }: { alvo: string; rotulo?: string; velocidade?: boolean; compacto?: boolean }) {
  const [falando, setFalando] = useState(false);
  const [suportado, setSuportado] = useState(true);
  const [vel, setVel] = useState(1);
  const [prog, setProg] = useState(0);
  const ativo = useRef(false);

  useEffect(() => {
    setSuportado(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { ativo.current = false; if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  function parar() {
    ativo.current = false;
    window.speechSynthesis.cancel();
    setFalando(false);
    setProg(0);
  }

  function alternar() {
    const s = window.speechSynthesis;
    if (falando) { parar(); return; }
    const texto = Array.from(document.querySelectorAll(alvo)).map((el) => el.textContent ?? "").join(". ").replace(/\s+/g, " ").trim();
    if (!texto) return;
    const falar = () => {
      const voz = s.getVoices().filter((v) => v.lang.toLowerCase().startsWith("pt"));
      const fem = voz.find((v) => /female|feminina|maria|francisca|luciana|vit[óo]ria|google portugu[êe]s/i.test(v.name)) || voz[0];
      // Frases em pedaços: alguns navegadores interrompem falas muito longas.
      const trechos = (texto.match(/[^.!?…]+[.!?…]*\s*/g) ?? [texto]).reduce<string[]>((acc, t) => {
        if (acc.length && acc[acc.length - 1].length + t.length < 180) acc[acc.length - 1] += t; else acc.push(t);
        return acc;
      }, []);
      s.cancel();
      ativo.current = true;
      setFalando(true);
      trechos.forEach((t, k) => {
        const ut = new SpeechSynthesisUtterance(t);
        ut.onstart = () => setProg(k / trechos.length);
        ut.lang = "pt-BR";
        if (fem) ut.voice = fem;
        ut.rate = vel;
        ut.onend = () => { if (k === trechos.length - 1) { ativo.current = false; setFalando(false); setProg(0); } };
        ut.onerror = () => { if (ativo.current && k === 0) { ativo.current = false; setFalando(false); } };
        s.speak(ut);
      });
    };
    if (s.getVoices().length) falar(); else { s.onvoiceschanged = () => { s.onvoiceschanged = null; falar(); }; setTimeout(falar, 400); }
  }

  if (!suportado) return null;
  if (compacto) {
    return (
      <div className="audio-linha">
        <button type="button" aria-pressed={falando} aria-label={falando ? "Parar áudio" : rotulo} title={falando ? "Parar áudio" : rotulo} onClick={alternar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/ouvir-icone.png" alt="" width={22} height={20} />
        </button>
        <span className="trilha" aria-hidden="true"><span style={{ width: `${Math.round(prog * 100)}%` }} /></span>
        <svg className={falando ? "onda falando" : "onda"} width="26" height="22" viewBox="0 0 26 22" fill="currentColor" aria-hidden="true"><rect x="1" y="8" width="2.500" height="6" rx="1"/><rect x="6" y="4" width="2.500" height="14" rx="1"/><rect x="11" y="0" width="2.500" height="22" rx="1"/><rect x="16" y="5" width="2.500" height="12" rx="1"/><rect x="21" y="8" width="2.500" height="6" rx="1"/></svg>
      </div>
    );
  }
  return (
    <span className="audio-grupo">
      <button type="button" className="btn-audio" aria-pressed={falando} onClick={alternar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ico-ouvir" src="/img/ouvir-icone.png" alt="" width={20} height={18} />
        {falando ? "Parar áudio" : rotulo}
      </button>
      {velocidade && (
        <label className="audio-vel">
          Velocidade
          <select value={vel} disabled={falando} onChange={(e) => setVel(Number(e.target.value))}>
            {VELOCIDADES.map((v) => <option key={v} value={v}>{v === 1 ? "Normal" : `${v}×`}</option>)}
          </select>
        </label>
      )}
    </span>
  );
}
