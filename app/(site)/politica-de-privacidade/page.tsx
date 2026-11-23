import type { Metadata } from "next";
import { PRIVACIDADE } from "@/lib/content.generated";
import { Rico, semMarcas } from "@/lib/rico";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function Privacidade() {
  return (
    <article className="pagina longa pv">
      <h1>Política de Privacidade</h1>
      <span className="sublinha" aria-hidden="true" />
      <div style={{ height: "1.2rem" }} />
      {PRIVACIDADE.map((raw, i) => {
        const t = semMarcas(raw);
        if (/^[IVX]+\.\s/.test(t) && t.length < 120) return <h2 key={i} className="sub-lato">{t}</h2>;
        if (t === "Consentimento" || t === "Interesse legítimo") return <h3 key={i}>{t}</h3>;
        if (t === t.toUpperCase() && t.length > 40) return <p key={i} className="caps"><Rico texto={raw} /></p>;
        return <p key={i}><Rico texto={raw} /></p>;
      })}
    </article>
  );
}
