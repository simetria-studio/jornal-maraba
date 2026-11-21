import Link from "next/link";
import { NAV_EXTRA } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="rodape">
      <hr className="linha-verde" />
      <div className="container">
        <span>© {new Date().getFullYear()} Jornal Marabá · Mídia Moderna Comunicação Ltda</span>
        <nav aria-label="Rodapé" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {NAV_EXTRA.slice(1).map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
