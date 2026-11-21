"use client";

import { useEffect, useRef, useState } from "react";

/** Lê o texto da página em voz feminina (Web Speech API do navegador). */
export default function LerEmVoz({ alvo }: { alvo: string }) {
  const [falando, setFalando] = useState(false);
  const [suportado, setSuportado] = useState(true);
  const u = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSuportado(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  function alternar() {
    const s = window.speechSynthesis;
    if (falando) { s.cancel(); setFalando(false); return; }
    const texto = document.querySelector(alvo)?.textContent?.replace(/\s+/g, " ").trim();
    if (!texto) return;
    const falar = () => {
      const voz = s.getVoices().filter((v) => v.lang.toLowerCase().startsWith("pt"));
      const fem = voz.find((v) => /female|feminina|maria|francisca|luciana|vit[óo]ria|google portugu[êe]s/i.test(v.name)) || voz[0];
      const ut = new SpeechSynthesisUtterance(texto);
      ut.lang = "pt-BR";
      if (fem) ut.voice = fem;
      ut.rate = 0.98;
      ut.onend = () => setFalando(false);
      ut.onerror = () => setFalando(false);
      u.current = ut;
      s.cancel();
      s.speak(ut);
      setFalando(true);
    };
    if (s.getVoices().length) falar(); else { s.onvoiceschanged = () => { s.onvoiceschanged = null; falar(); }; setTimeout(falar, 400); }
  }

  if (!suportado) return null;
  return (
    <button type="button" className="btn-audio" aria-pressed={falando} onClick={alternar}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ico-ouvir" src="/img/ouvir-icone.png" alt="" width={20} height={18} />
      {falando ? "Parar áudio" : "Ouvir esta página"}
    </button>
  );
}
