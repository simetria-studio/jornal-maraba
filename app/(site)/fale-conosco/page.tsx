import type { Metadata } from "next";
import LerEmVoz from "@/components/LerEmVoz";
import FormularioContato from "@/components/FormularioContato";
import { FALE_CONOSCO } from "@/lib/content.generated";

export const metadata: Metadata = { title: "Fale Conosco" };

export default function FaleConosco() {
  const [intro, promessa, chamadaAnuncio, ...resto] = FALE_CONOSCO.map((t) => t.replace(/\s+/g, " ").trim());
  return (
    <div className="pagina">
      <h1>Fale Conosco</h1>
      <span className="sublinha" aria-hidden="true" />
      <div><LerEmVoz alvo="#texto-contato" /></div>

      <div id="texto-contato">
        <p>{intro}</p>
        <p>{promessa}</p>

        <section className="anuncie" aria-labelledby="anuncie">
          <h2 id="anuncie"><span className="destaque-cinza" style={{ fontFamily: "var(--f-corpo)", fontSize: "1rem", fontWeight: 900 }}>{chamadaAnuncio}</span></h2>
          {resto.map((t, i) => {
            if (t.startsWith("Soluções em Publicidade")) return <h2 key={i}><span className="destaque-cinza" style={{ fontFamily: "var(--f-corpo)", fontSize: "1rem", fontWeight: 900 }}>{t}</span></h2>;
            if (t.endsWith(":")) return <h3 key={i}>{t}</h3>;
            return <p key={i}>{t}</p>;
          })}
        </section>
      </div>

      <p style={{ fontFamily: "var(--f-ui)", fontWeight: 700 }}>Informe nos campos abaixo para qual setor deseja enviar sua mensagem.</p>
      <FormularioContato />
    </div>
  );
}
