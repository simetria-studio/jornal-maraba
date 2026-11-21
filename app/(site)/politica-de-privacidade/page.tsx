import type { Metadata } from "next";
import { PRIVACIDADE } from "@/lib/content.generated";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function Privacidade() {
  return (
    <article className="pagina longa">
      <h1>Política de Privacidade</h1>
      <span className="sublinha" aria-hidden="true" />
      <div style={{ height: "1.2rem" }} />
      {PRIVACIDADE.map((raw, i) => {
        const t = raw.replace(/\s+/g, " ").trim();
        if (/^[IVX]+\.\s/.test(t)) return <h2 key={i}>{t}</h2>;
        if (t === "Consentimento" || t === "Interesse legítimo") return <h3 key={i}>{t}</h3>;
        if (t === t.toUpperCase() && t.length > 40) return <p key={i} className="caps">{t}</p>;
        return <p key={i}>{t}</p>;
      })}
    </article>
  );
}
