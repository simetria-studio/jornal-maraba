import type { Metadata } from "next";
import Image from "next/image";
import LerEmVoz from "@/components/LerEmVoz";
import { QUEM_SOMOS } from "@/lib/content.generated";

export const metadata: Metadata = { title: "Quem Somos" };

export default function QuemSomos() {
  return (
    <article className="pagina" id="texto-pagina">
      <h1>Quem Somos</h1>
      <div><LerEmVoz alvo="#texto-pagina" compacto /></div>
      {QUEM_SOMOS.map((t, i) => {
        const txt = t.replace(/\s+/g, " ").trim();
        if (txt.startsWith("“") || txt.startsWith('"')) return <p key={i} className="citacao">{txt}</p>;
        if (txt === "Chegamos, Marabá!") return <p key={i} className="fecho">{txt}</p>;
        return <p key={i}>{txt.split(/([A-ZÁÉÍÓÚÂÊÔÃÕÇ]{5,})/).map((x, k) => (k % 2 ? <strong key={k}>{x}</strong> : x))}</p>;
      })}
      <Image className="foto-fim" src="/img/quem-somos.png" alt="Marabá, cidade que o Jornal Marabá quer informar e unir" width={600} height={1024} />
      <div className="assinatura">
        <strong>Carlos Santos</strong>
        <span>Diretor - Fundador</span>
      </div>
    </article>
  );
}
