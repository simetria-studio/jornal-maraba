import Image from "next/image";
import { LOJAS } from "@/lib/data";

// Área de montagem do anúncio: troque textos, imagens e lojas aqui (ou em lib/data.ts).
export default function AnuncioSupermercado() {
  return (
    <section aria-label="Anúncio: O Sacolão Supermercados">
      <div className="anuncio">
        <p className="anuncio-texto">
          <span className="v">Precinho</span>
          <span className="g">Variedade</span>
          <span className="g s">e</span>
          <span className="g">Qualidade</span>
          <span className="g s">é</span>
          <span className="v grande">AQUI!</span>
        </p>
        <Image className="anuncio-mulher" src="/img/ad-mulher.png" alt="Mulher sorrindo com uma cesta de frutas, legumes e verduras" width={321} height={435} priority />
        <Image className="anuncio-logo" src="/img/ad-sacolao.png" alt="O Sacolão Supermercados" width={280} height={280} priority />
      </div>
      <div className="lojas">
        {LOJAS.map((l) => (
          <div className="loja" key={l.n}>
            <h3>Loja {l.n}</h3>
            <p>{l.bairro}:<br />{l.fim}</p>
            <p className="tel"><a href={`tel:+55${l.tel.replace(/\D/g, "")}`}>
              <span className="ddd">{l.tel.slice(0, 4)}</span>{l.tel.slice(4)}
            </a></p>
          </div>
        ))}
      </div>
    </section>
  );
}
