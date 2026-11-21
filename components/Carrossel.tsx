"use client";

import { useState } from "react";
import type { FotoGaleria } from "@/lib/galeria";

/** Carrossel de imagens da matéria: setas, miniaturas, teclado (← →) e descrição lida por leitores de tela. */
export default function Carrossel({ fotos }: { fotos: FotoGaleria[] }) {
  const [i, setI] = useState(0);
  const n = fotos.length;
  if (!n) return null;
  const ir = (d: number) => setI((x) => (x + d + n) % n);
  const f = fotos[i];

  return (
    <section
      className="carrossel"
      aria-roledescription="carrossel"
      aria-label="Galeria de imagens da matéria"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); ir(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); ir(1); }
      }}
    >
      <div className="car-palco">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={f.src} src={f.src} alt={f.alt} />
        {n > 1 && (
          <>
            <button type="button" className="car-seta ant" onClick={() => ir(-1)} aria-label="Imagem anterior">‹</button>
            <button type="button" className="car-seta prox" onClick={() => ir(1)} aria-label="Próxima imagem">›</button>
          </>
        )}
      </div>
      <div className="car-rodape">
        <p className="car-legenda" aria-live="polite">
          <span className="car-conta">{i + 1} de {n}</span>
          {f.alt && <span> {f.alt}</span>}
        </p>
        {n > 1 && (
          <ul className="car-pontos">
            {fotos.map((x, k) => (
              <li key={x.src + k}>
                <button type="button" onClick={() => setI(k)} aria-label={`Ir para a imagem ${k + 1}`} aria-current={k === i ? "true" : undefined} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
