"use client";

import { useState } from "react";

const ICONES = [
  { id: "whatsapp", rotulo: "Compartilhar no WhatsApp" },
  { id: "facebook", rotulo: "Compartilhar no Facebook" },
  { id: "instagram", rotulo: "Copiar o link para colar no Instagram" },
  { id: "email", rotulo: "Enviar por e-mail" },
] as const;

export default function Compartilhar({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  function abrir(id: (typeof ICONES)[number]["id"]) {
    const url = window.location.href;
    const t = encodeURIComponent(titulo);
    const u = encodeURIComponent(url);
    if (id === "whatsapp") window.open(`https://wa.me/?text=${t}%20${u}`, "_blank", "noopener,noreferrer");
    else if (id === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener,noreferrer");
    else if (id === "email") window.location.href = `mailto:?subject=${t}&body=${u}`;
    else {
      navigator.clipboard?.writeText(url).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500); }).catch(() => {});
    }
  }

  return (
    <div className="compartilhar" role="group" aria-label="Compartilhar esta matéria">
      {ICONES.map((i) => (
        <button key={i.id} type="button" aria-label={i.rotulo} title={i.rotulo} onClick={() => abrir(i.id)}>
          <img src={`/img/violencia/ic-${i.id}.png`} alt="" />
        </button>
      ))}
      <span className="sr-only" role="status" aria-live="polite">{copiado ? "Link copiado" : ""}</span>
      {copiado && <span className="copiado" aria-hidden="true">Link copiado</span>}
    </div>
  );
}
