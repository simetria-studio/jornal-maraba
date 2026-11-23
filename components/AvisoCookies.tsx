"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CHAVE = "jm-cookies";

// Aviso ao acessar o site — texto conforme "1- Todo texto do cabeçalho _28 de outubro.docx"
export default function AvisoCookies() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(CHAVE)) setAberto(true); } catch { setAberto(true); }
  }, []);

  if (!aberto) return null;

  function prosseguir() {
    try { localStorage.setItem(CHAVE, "1"); } catch {}
    setAberto(false);
  }

  return (
    <div className="aviso-cookies" role="dialog" aria-label="Aviso de cookies">
      <p>
        Utilizamos cookies e outras tecnologias semelhantes para melhorar a sua experiência no portal, personalizando
        publicidades, recomendando conteúdos e oferecendo serviços. Saiba a respeito consultando a nossa página de{" "}
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>
      <button type="button" onClick={prosseguir}>OK. PROSSEGUIR!</button>
    </div>
  );
}
