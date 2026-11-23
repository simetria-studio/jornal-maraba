import type { Metadata } from "next";
import LerEmVoz from "@/components/LerEmVoz";
import FormularioContato from "@/components/FormularioContato";
import { FALE_CONOSCO } from "@/lib/content.generated";
import { Rico, semMarcas } from "@/lib/rico";

export const metadata: Metadata = { title: "Fale Conosco" };

export default function FaleConosco() {
  const [intro, chamadaAnuncio, ...resto] = FALE_CONOSCO.map((t) => t.replace(/\s+/g, " ").trim());
  return (
    <div className="pagina fc">
      <h1>Fale Conosco</h1>
      <span className="sublinha" aria-hidden="true" />
      <div><LerEmVoz alvo="#texto-contato" compacto /></div>

      <div id="texto-contato">
        <p><Rico texto={intro} /></p>

        <section className="anuncie" aria-labelledby="anuncie">
          <h2 id="anuncie"><span className="destaque-cinza" style={{ fontFamily: "var(--f-corpo)", fontSize: "1rem", fontWeight: 900 }}>{semMarcas(chamadaAnuncio)}</span></h2>
          {resto.map((raw, i) => {
            const t = semMarcas(raw);
            if (t.startsWith("Soluções")) return <h2 key={i}><span className="destaque-cinza" style={{ fontFamily: "var(--f-corpo)", fontSize: "1rem", fontWeight: 900 }}>{t}</span></h2>;
            if (t.endsWith(":") && t.length < 40) return <h3 key={i} className="h-reto">{t}</h3>;
            return <p key={i}><Rico texto={raw} /></p>;
          })}
        </section>
      </div>

      <p style={{ fontFamily: "var(--f-ui)", fontWeight: 700 }}>Informe nos campos abaixo o setor ao qual deseja comunicar e mandar sua mensagem.</p>
      <FormularioContato />
    </div>
  );
}
